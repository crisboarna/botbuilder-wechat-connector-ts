import { IAddress, IConnector, IMessage, Message } from 'botbuilder';
import { forEachOfSeries } from 'async';
import { IWebRequest, IWebResponse } from '../interfaces/IWeb';
import { IWechatMessage } from '../interfaces/IWechatMessage';
import { IWechatAttachmentType, IWechatOptions } from '..';
// @ts-ignore Typings do not exist for wechat
import * as wechat from 'wechat';
// @ts-ignore Typings do not exist for wechat-api
import * as WechatAPI from 'wechat-api';

/**
 * Connector class for Botframework V3 that interacts with Wechat platform
 */
export class WechatConnector implements IConnector {

  private options: IWechatOptions;
  private wechatAPI: any;
  private handler: any;

  constructor(opts: IWechatOptions) {
    this.options = { enableReply: true, ...opts };
    this.wechatAPI = new WechatAPI(this.options.appID, this.options.appSecret);
  }

  public onEvent(handler: any) {
    this.handler = handler;
  }

    /**
     * Provides hook to be used with Express or AWS Lambda
     */
  public listen() {
    let config: any = this.options.appToken;

    if (this.options.encodingAESKey) {
      config = {
        token: this.options.appToken,
        appid: this.options.appID,
        encodingAESKey: this.options.encodingAESKey,
      };
    }

    return wechat(config, (req: IWebRequest, res: IWebResponse, next: Function) => {
      const wechatMessage = req.weixin;

      if (this.options.enableReply) {
        this.processMessage(wechatMessage);
        res.status(200).end();
      } else {
        next();
      }
    });
  }

    /**
     * Hook point for Botframework to create new conversation for user via connector
     * @param {IAddress} address
     * @param {Function} cb
     */
  public startConversation(address: IAddress, cb: Function) {
    cb(null, address);
  }

    /**
     * Hook point for Botframework to send messages via connector
     * @param {IMessage[]} messages
     * @param {(err: Error, addresses?: IAddress[]) => void} done
     */
  public send(messages: IMessage[], done: (err: Error, addresses?: IAddress[]) => void) {
    forEachOfSeries(messages, (msg: any, _index: any, cb: Function) => {
      this.postMessage(msg, cb);
    },              done);
  }

  private processMessage(wechatMessage: IWechatMessage) {
    if (!this.handler) {
      throw new Error('No handler for message processing !');
    }

    const atts = [];
    const msgType = wechatMessage.MsgType;

    const addr: IAddress = {
      channelId: 'wechat',
      user: { id: wechatMessage.FromUserName, name: 'Unknown' },
      bot: { id: wechatMessage.ToUserName, name: 'WechatBot' },
      conversation: { id: wechatMessage.FromUserName.slice(wechatMessage.FromUserName.length / 2, wechatMessage.FromUserName.length) },
    };

    let msg = new Message()
            .address(addr)
            .timestamp(this.convertTimeStamp(wechatMessage.CreateTime));

    if (msgType === 'text') {
      msg = msg.text(wechatMessage.Content);
    } else {
      msg = msg.text('');
    }

    switch (msgType) {
      case 'image':
        atts.push({
          contentType: IWechatAttachmentType.Image,
          content: {
            url: wechatMessage.PicUrl,
            mediaId: wechatMessage.MediaId,
          },
        });
        break;
      case 'voice':
        atts.push({
          contentType: IWechatAttachmentType.Voice,
          content: {
            format: wechatMessage.Format,
            mediaId: wechatMessage.MediaId,
            recognition: wechatMessage.Recognition,
          },
        });
        break;
      case 'video':
        atts.push({
          contentType: IWechatAttachmentType.Video,
          content: {
            mediaId: wechatMessage.MediaId,
            thumbMediaId: wechatMessage.ThumbMediaId,
          },
        });
        break;
      case 'shortvideo':
        atts.push({
          contentType: IWechatAttachmentType.ShortVideo,
          content: {
            mediaId: wechatMessage.MediaId,
            thumbMediaId: wechatMessage.ThumbMediaId,
          },
        });
        break;
      case 'link':
        atts.push({
          contentType: IWechatAttachmentType.Link,
          content: {
            title: wechatMessage.Title,
            description: wechatMessage.Description,
            url: wechatMessage.Url,
          },
        });
        break;
      case 'location':
        atts.push({
          contentType: IWechatAttachmentType.Location,
          content: {
            locationX: wechatMessage.Location_X,
            locationY: wechatMessage.Location_Y,
            scale: wechatMessage.Scale,
            label: wechatMessage.Label,
          },
        });
        break;

    }

    msg = msg.attachments(atts);
    this.handler([msg.toMessage()]);
    return this;
  }

  private postMessage(message: any, cb: any) {
    const addr = message.address;
    const user = addr.user;

    if (message.text && message.text.length > 0) {
      this.wechatAPI.sendText(user.id, message.text, this.errorHandler);
    } else if (message.attachments && message.attachments.length > 0) {
      for (let i = 0; i < message.attachments.length; i++) {
        const atm = message.attachments[i];
        const atmType = atm.contentType;
        const atmCont = atm.content;

        if (!atmCont) {
          console.warn(`No message content found for message: ${JSON.stringify(message)}`);
          continue;
        }

        switch (atmType) {
          case IWechatAttachmentType.Image:
            this.wechatAPI.sendImage(user.id, atmCont.mediaId, this.errorHandler);
            break;
          case IWechatAttachmentType.Voice:
            this.wechatAPI.sendVoice(user.id, atmCont.mediaId, this.errorHandler);
            break;
          case IWechatAttachmentType.Video:
            this.wechatAPI.sendVideo(user.id, atmCont.mediaId, atmCont.thumbMediaId, this.errorHandler);
            break;
          case IWechatAttachmentType.Music:
            this.wechatAPI.sendMusic(user.id, atmCont, this.errorHandler);
            break;
          case IWechatAttachmentType.News:
            this.wechatAPI.sendNews(user.id, atmCont, this.errorHandler);
            break;
          case IWechatAttachmentType.MpNews:
            this.wechatAPI.sendMpNews(user.id, atmCont.mediaId, this.errorHandler);
            break;
          case IWechatAttachmentType.Card:
            this.wechatAPI.sendCard(user.id, atmCont, this.errorHandler);
            break;
          default:
            console.error(`Unknown attachment: ${atmType}`);
            break;
        }
      }
    } else {
      console.error(`Invalid message: ${JSON.stringify(message)}`);
    }

    cb();
  }

  private convertTimeStamp(timestamp: string) {
    return new Date(parseInt(timestamp, 10) * 1000).toISOString();
  }

  private errorHandler(err: Error) {
    if (err) {
      console.error(`Error: ${JSON.stringify(err)}`);
    } else {
      console.error('An error happened while sending message to Wechat API.');
    }
  }
}
