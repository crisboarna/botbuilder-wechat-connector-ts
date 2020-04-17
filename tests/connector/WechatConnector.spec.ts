import {IWechatAttachmentType} from "../../src";

describe('WechatConnector', () => {
    let wechatConnector: any;
    const TEST_FROM_USERNAME = 'TST_FROM_USER';
    const TEST_TO_USERNAME = 'TST_TO_USER';
    const TEST_MESSAGE = 'TEST_MESSAGE';
    const TEST_APP_ID = 'TEST_APP_ID';
    const TEST_APP_SECRET = 'TEST_APP_SECRET';
    const TEST_USER_ID = 1;
    const TEST_MEDIA_ID = 101;
    const TEST_THUMB_MEDIA_ID = 123;
    const TEST_ADDRESS = {address: { user: { id: TEST_USER_ID }}};
    const TEST_ERROR_MESSAGE = 'TEST_ERROR_MESSAGE';
    const options = {
        appID: TEST_APP_ID,
        appSecret: TEST_APP_SECRET,
    };
    const mockNext = jest.fn();
    const mockHandler = jest.fn();
    const mockDone = jest.fn();
    const mockSendText = jest.fn();
    const mockSendImage = jest.fn();
    const mockSendVoice = jest.fn();
    const mockSendVideo = jest.fn();
    const mockSendMusic = jest.fn();
    const mockSendNews = jest.fn();
    const mockSendMpNews = jest.fn();
    const mockSendCard = jest.fn();
    const mockWechatAPI = {
        sendText: mockSendText,
        sendImage: mockSendImage,
        sendVoice: mockSendVoice,
        sendVideo: mockSendVideo,
        sendMusic: mockSendMusic,
        sendNews: mockSendNews,
        sendMpNews: mockSendMpNews,
        sendCard: mockSendCard
    };
    const mockAddress = jest.fn();
    const mockTimeStamp = jest.fn();
    const mockText = jest.fn();
    const mockAttachments = jest.fn();
    const mockToMessage = jest.fn();
    const mockMessage = {
        address: mockAddress,
        timestamp: mockTimeStamp,
        text: mockText,
        attachments: mockAttachments,
        toMessage: mockToMessage
    };
    const mockBotBuilderkMessageWrapper = function mocBotBuilderkMessageWrapper() { return mockMessage };
    const mockBotBuilder = {
        Message: mockBotBuilderkMessageWrapper
    };
    const mockWechatAPIWrapper = function mockWechatAPIWrapper() { return  mockWechatAPI };
    const mockAsyncWrapper = {
        forEachOfSeries: (messages: any[], fn: any, done: any) => fn(messages[0], 0, done)
    };
    const mockWechat = (_config: any, fn:Function) => (req:any, res: any, next: Function) => fn(req, res, next);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('wechat-api', () => mockWechatAPIWrapper);
        jest.mock('wechat', () => mockWechat);
        jest.mock('async', () => mockAsyncWrapper);
        jest.mock('botbuilder', () => mockBotBuilder);
        jest.spyOn(console,'error');
        jest.spyOn(console,'warn');
        wechatConnector = new (require('../../src/connector/WechatConnector').WechatConnector)(options);
    });

    describe('constructor', () => {
        it('given constructor params, creates and sets appropriate values', () => {
            const testWechatConnector = new (require('../../src/connector/WechatConnector').WechatConnector)(options);
            expect(testWechatConnector.options).toEqual({...options, enableReply: true});
        });
    });

    describe('startConversation', () => {
        it('calls the cb with expected address', () => {
            const mockCb = jest.fn();
            const mockAddress = {
                addr: 'test'
            };
            wechatConnector.startConversation(mockAddress, mockCb);

            expect(mockCb).toHaveBeenCalled();
            expect(mockCb).toHaveBeenCalledWith(null, mockAddress);
        });
    });

    describe('listen', () => {
        it('given enableReply false, do not process message', () => {
            wechatConnector.options.encodingAESKey = true;
            wechatConnector.options.enableReply = false;
            const listener = wechatConnector.listen();
            listener({}, {}, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('given enableReply true and processMessage execution successful, send response 200', () => {
            wechatConnector.processMessage = () => {};
            let mockRes: any;
            const mockStatus = jest.fn();
            const mockEnd = jest.fn();
            mockRes = {
                status: mockStatus,
                end: mockEnd
            };
            mockStatus.mockReturnValue(mockRes);
            mockEnd.mockReturnValue(mockRes);
            const listener = wechatConnector.listen();

            listener({}, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(0);
            expect(mockStatus).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockEnd).toHaveBeenCalledTimes(1);
        });
    });

    describe('processMessage', () => {
        let mockRes: any;
        const mockStatus = jest.fn();
        const mockEnd = jest.fn();
        const req: any = {
            weixin: {
                MsgType: 'text',
                CreateTime: '120024000',
                FromUserName: TEST_FROM_USERNAME,
                ToUserName: TEST_TO_USERNAME,
                Content: TEST_MESSAGE
            }
        };
        const EXPECTED_ADDRESS_RESULT = {
            bot: {
                id: TEST_TO_USERNAME,
                name: 'WechatBot'
            },
            channelId: 'wechat',
            conversation: {id: 'OM_USER'},
            user: {id: TEST_FROM_USERNAME, name: 'Unknown'}
        };

        beforeEach(() => {
           wechatConnector.handler =  mockHandler;
            mockRes = {
                status: mockStatus,
                end: mockEnd
            };
            mockStatus.mockReturnValue(mockRes);
            mockEnd.mockReturnValue(mockRes);
            mockAddress.mockReturnValue(mockMessage);
            mockTimeStamp.mockReturnValue(mockMessage);
            mockText.mockReturnValue(mockMessage);
            mockAttachments.mockReturnValue(mockMessage);
        });

        it('given no handler, throws error', () => {
            wechatConnector.handler = undefined;
            const listener = wechatConnector.listen();
            expect(() => listener({}, {}, mockNext)).toThrow('No handler for message processing !');
        });

        it('given text message, handle message and enrich based on type', () => {
            const listener = wechatConnector.listen();

            listener(req, mockRes, mockNext);

            expect(mockAddress).toHaveBeenCalled();
            expect(mockAddress).toHaveBeenCalledTimes(1);
            expect(mockAddress).toHaveBeenCalledWith(EXPECTED_ADDRESS_RESULT);
            expect(mockText).toHaveBeenCalled();
            expect(mockText).toHaveBeenCalledTimes(1);
            expect(mockText).toHaveBeenCalledWith(TEST_MESSAGE);
            expect(mockTimeStamp).toHaveBeenCalled();
            expect(mockTimeStamp).toHaveBeenCalledTimes(1);
            expect(mockTimeStamp).toHaveBeenCalledWith('1973-10-21T04:00:00.000Z');
            expect(mockAttachments).toHaveBeenCalled();
            expect(mockAttachments).toHaveBeenCalledTimes(1);
            expect(mockAttachments).toHaveBeenCalledWith([]);
        });

        it('given image message, handle message and enrich based on type', () => {
            const PIC_URL = 'TEST_PIC_URL';
            req.weixin.MsgType = 'image';
            req.weixin.PicUrl = PIC_URL;
            req.weixin.MediaId = TEST_MEDIA_ID;
            const EXPECTED_ATTACHMENT = {
                contentType: IWechatAttachmentType.Image,
                content: {
                    url: PIC_URL,
                    mediaId: TEST_MEDIA_ID
                }
            };
            const listener = wechatConnector.listen();

            listener(req, mockRes, mockNext);

            expect(mockAddress).toHaveBeenCalled();
            expect(mockAddress).toHaveBeenCalledTimes(1);
            expect(mockAddress).toHaveBeenCalledWith(EXPECTED_ADDRESS_RESULT);
            expect(mockText).toHaveBeenCalled();
            expect(mockText).toHaveBeenCalledTimes(1);
            expect(mockText).toHaveBeenCalledWith('');
            expect(mockTimeStamp).toHaveBeenCalled();
            expect(mockTimeStamp).toHaveBeenCalledTimes(1);
            expect(mockTimeStamp).toHaveBeenCalledWith('1973-10-21T04:00:00.000Z');
            expect(mockAttachments).toHaveBeenCalled();
            expect(mockAttachments).toHaveBeenCalledTimes(1);
            expect(mockAttachments).toHaveBeenCalledWith([EXPECTED_ATTACHMENT]);
        });

        it('given voice message, handle message and enrich based on type', () => {
            const TEST_FORMAT = 'TEST_FORMAT';
            const TEST_RECOGNITION = 'TEST_RECOGNITION';
            req.weixin.MsgType = 'voice';
            req.weixin.Format = TEST_FORMAT;
            req.weixin.Recognition = TEST_RECOGNITION;
            req.weixin.MediaId = TEST_MEDIA_ID;
            const EXPECTED_ATTACHMENT = {
                contentType: IWechatAttachmentType.Voice,
                content: {
                    format: TEST_FORMAT,
                    recognition: TEST_RECOGNITION,
                    mediaId: TEST_MEDIA_ID
                }
            };
            const listener = wechatConnector.listen();

            listener(req, mockRes, mockNext);

            expect(mockAddress).toHaveBeenCalled();
            expect(mockAddress).toHaveBeenCalledTimes(1);
            expect(mockAddress).toHaveBeenCalledWith(EXPECTED_ADDRESS_RESULT);
            expect(mockText).toHaveBeenCalled();
            expect(mockText).toHaveBeenCalledTimes(1);
            expect(mockText).toHaveBeenCalledWith('');
            expect(mockTimeStamp).toHaveBeenCalled();
            expect(mockTimeStamp).toHaveBeenCalledTimes(1);
            expect(mockTimeStamp).toHaveBeenCalledWith('1973-10-21T04:00:00.000Z');
            expect(mockAttachments).toHaveBeenCalled();
            expect(mockAttachments).toHaveBeenCalledTimes(1);
            expect(mockAttachments).toHaveBeenCalledWith([EXPECTED_ATTACHMENT]);
        });

        it('given video message, handle message and enrich based on type', () => {
            req.weixin.MsgType = 'video';
            req.weixin.ThumbMediaId = TEST_THUMB_MEDIA_ID;
            req.weixin.MediaId = TEST_MEDIA_ID;
            const EXPECTED_ATTACHMENT = {
                contentType: IWechatAttachmentType.Video,
                content: {
                    thumbMediaId: TEST_THUMB_MEDIA_ID,
                    mediaId: TEST_MEDIA_ID
                }
            };
            const listener = wechatConnector.listen();

            listener(req, mockRes, mockNext);

            expect(mockAddress).toHaveBeenCalled();
            expect(mockAddress).toHaveBeenCalledTimes(1);
            expect(mockAddress).toHaveBeenCalledWith(EXPECTED_ADDRESS_RESULT);
            expect(mockText).toHaveBeenCalled();
            expect(mockText).toHaveBeenCalledTimes(1);
            expect(mockText).toHaveBeenCalledWith('');
            expect(mockTimeStamp).toHaveBeenCalled();
            expect(mockTimeStamp).toHaveBeenCalledTimes(1);
            expect(mockTimeStamp).toHaveBeenCalledWith('1973-10-21T04:00:00.000Z');
            expect(mockAttachments).toHaveBeenCalled();
            expect(mockAttachments).toHaveBeenCalledTimes(1);
            expect(mockAttachments).toHaveBeenCalledWith([EXPECTED_ATTACHMENT]);
        });

        it('given shortvideo message, handle message and enrich based on type', () => {
            req.weixin.MsgType = 'shortvideo';
            req.weixin.ThumbMediaId = TEST_THUMB_MEDIA_ID;
            req.weixin.MediaId = TEST_MEDIA_ID;
            const EXPECTED_ATTACHMENT = {
                contentType: IWechatAttachmentType.ShortVideo,
                content: {
                    thumbMediaId: TEST_THUMB_MEDIA_ID,
                    mediaId: TEST_MEDIA_ID
                }
            };
            const listener = wechatConnector.listen();

            listener(req, mockRes, mockNext);

            expect(mockAddress).toHaveBeenCalled();
            expect(mockAddress).toHaveBeenCalledTimes(1);
            expect(mockAddress).toHaveBeenCalledWith(EXPECTED_ADDRESS_RESULT);
            expect(mockText).toHaveBeenCalled();
            expect(mockText).toHaveBeenCalledTimes(1);
            expect(mockText).toHaveBeenCalledWith('');
            expect(mockTimeStamp).toHaveBeenCalled();
            expect(mockTimeStamp).toHaveBeenCalledTimes(1);
            expect(mockTimeStamp).toHaveBeenCalledWith('1973-10-21T04:00:00.000Z');
            expect(mockAttachments).toHaveBeenCalled();
            expect(mockAttachments).toHaveBeenCalledTimes(1);
            expect(mockAttachments).toHaveBeenCalledWith([EXPECTED_ATTACHMENT]);
        });

        it('given link message, handle message and enrich based on type', () => {
            const TEST_URL = 'TEST_URL';
            const TEST_TITLE = 'TEST_TITLE';
            const TEST_DESCRIPTION = 'TEST_DESCRIPTION';
            req.weixin.MsgType = 'link';
            req.weixin.Title = TEST_TITLE;
            req.weixin.Url = TEST_URL;
            req.weixin.Description = TEST_DESCRIPTION;
            const EXPECTED_ATTACHMENT = {
                contentType: IWechatAttachmentType.Link,
                content: {
                    title: TEST_TITLE,
                    description: TEST_DESCRIPTION,
                    url: TEST_URL
                }
            };
            const listener = wechatConnector.listen();

            listener(req, mockRes, mockNext);

            expect(mockAddress).toHaveBeenCalled();
            expect(mockAddress).toHaveBeenCalledTimes(1);
            expect(mockAddress).toHaveBeenCalledWith(EXPECTED_ADDRESS_RESULT);
            expect(mockText).toHaveBeenCalled();
            expect(mockText).toHaveBeenCalledTimes(1);
            expect(mockText).toHaveBeenCalledWith('');
            expect(mockTimeStamp).toHaveBeenCalled();
            expect(mockTimeStamp).toHaveBeenCalledTimes(1);
            expect(mockTimeStamp).toHaveBeenCalledWith('1973-10-21T04:00:00.000Z');
            expect(mockAttachments).toHaveBeenCalled();
            expect(mockAttachments).toHaveBeenCalledTimes(1);
            expect(mockAttachments).toHaveBeenCalledWith([EXPECTED_ATTACHMENT]);
        });

        it('given location message, handle message and enrich based on type', () => {
            const TEST_X = 'TEST_X';
            const TEST_Y = 'TEST_Y';
            const TEST_LABEL = 'TEST_LABEL';
            const TEST_SCALE = 'TEST_SCALE';
            req.weixin.MsgType = 'location';
            req.weixin.Location_X = TEST_X;
            req.weixin.Location_Y = TEST_Y;
            req.weixin.Label = TEST_LABEL;
            req.weixin.Scale = TEST_SCALE;
            const EXPECTED_ATTACHMENT = {
                contentType: IWechatAttachmentType.Location,
                content: {
                    locationX: TEST_X,
                    locationY: TEST_Y,
                    label: TEST_LABEL,
                    scale: TEST_SCALE
                }
            };
            const listener = wechatConnector.listen();

            listener(req, mockRes, mockNext);

            expect(mockAddress).toHaveBeenCalled();
            expect(mockAddress).toHaveBeenCalledTimes(1);
            expect(mockAddress).toHaveBeenCalledWith(EXPECTED_ADDRESS_RESULT);
            expect(mockText).toHaveBeenCalled();
            expect(mockText).toHaveBeenCalledTimes(1);
            expect(mockText).toHaveBeenCalledWith('');
            expect(mockTimeStamp).toHaveBeenCalled();
            expect(mockTimeStamp).toHaveBeenCalledTimes(1);
            expect(mockTimeStamp).toHaveBeenCalledWith('1973-10-21T04:00:00.000Z');
            expect(mockAttachments).toHaveBeenCalled();
            expect(mockAttachments).toHaveBeenCalledTimes(1);
            expect(mockAttachments).toHaveBeenCalledWith([EXPECTED_ATTACHMENT]);
        });
    });

    describe('send', () => {
        it('given invalid message type, prints error and returns', () => {
            const TEST_PAYLOAD = TEST_ADDRESS;
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith(`Invalid message: ${JSON.stringify(TEST_ADDRESS)}`);
        });

        it('given text message type and wechat sendText API error with error payload logs error and returns', () => {
            mockSendText.mockImplementation((_id, _msg, error) => error(TEST_ERROR_MESSAGE));
            const TEST_PAYLOAD = {...TEST_ADDRESS, text: TEST_MESSAGE};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalled();
            expect(mockSendText).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalledWith(TEST_USER_ID, TEST_MESSAGE, expect.any(Function));
            expect(console.error).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith(`Error: ${JSON.stringify(TEST_ERROR_MESSAGE)}`);
        });

        it('given text message type and wechat sendText API error without error payload logs error and returns', () => {
            mockSendText.mockImplementation((_id, _msg, error) => error());
            const TEST_PAYLOAD = {...TEST_ADDRESS, text: TEST_MESSAGE};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalled();
            expect(mockSendText).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalledWith(TEST_USER_ID, TEST_MESSAGE, expect.any(Function));
            expect(console.error).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith('An error happened while sending message to Wechat API.');
        });

        it('given text message type and wechat sendText API success returns', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, text: TEST_MESSAGE};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalled();
            expect(mockSendText).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalledWith(TEST_USER_ID, TEST_MESSAGE, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(0);
        });

        it('given attachment message type and unknown attachment type log warning and return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{invalidType: TEST_ERROR_MESSAGE, invalidContent: 1}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalledTimes(0);
            expect(console.warn).toHaveBeenCalledTimes(1);
            expect(console.warn).toHaveBeenCalledWith(`No message content found for message: ${JSON.stringify(TEST_PAYLOAD)}`);
        });

        it('given attachment message type and unknown attachment type log error and return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: TEST_ERROR_MESSAGE, content: 1}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalledTimes(0);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith(`Unknown attachment: ${TEST_ERROR_MESSAGE}`);
        });

        it('given attachment message type, Image attachment type and wechat Image API error, log error and return', () => {
            mockSendImage.mockImplementation((_id, _msg, error) => error());
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Image, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalledTimes(0);
            expect(mockSendImage).toHaveBeenCalled();
            expect(mockSendImage).toHaveBeenCalledTimes(1);
            expect(mockSendImage).toHaveBeenCalledWith(TEST_USER_ID, TEST_MEDIA_ID, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('An error happened while sending message to Wechat API.');
        });

        it('given attachment message type, Image attachment type and wechat Image API success return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Image, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendText).toHaveBeenCalledTimes(0);
            expect(mockSendImage).toHaveBeenCalled();
            expect(mockSendImage).toHaveBeenCalledTimes(1);
            expect(mockSendImage).toHaveBeenCalledWith(TEST_USER_ID, TEST_MEDIA_ID, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(0);
        });

        it('given attachment message type, Voice attachment type and wechat Voice API error, log error and return', () => {
            mockSendVoice.mockImplementation((_id, _msg, error) => error());
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Voice, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendVoice).toHaveBeenCalled();
            expect(mockSendVoice).toHaveBeenCalledTimes(1);
            expect(mockSendVoice).toHaveBeenCalledWith(TEST_USER_ID, TEST_MEDIA_ID, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('An error happened while sending message to Wechat API.');
        });

        it('given attachment message type, Voice attachment type and wechat Voice API success return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Voice, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendVoice).toHaveBeenCalled();
            expect(mockSendVoice).toHaveBeenCalledTimes(1);
            expect(mockSendVoice).toHaveBeenCalledWith(TEST_USER_ID, TEST_MEDIA_ID, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(0);
        });

        it('given attachment message type, Video attachment type and wechat Video API error, log error and return', () => {
            mockSendVideo.mockImplementation((_id, _msg, _thumb, error) => error());
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Video, content: {mediaId: TEST_MEDIA_ID, thumbMediaId: TEST_THUMB_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendVideo).toHaveBeenCalled();
            expect(mockSendVideo).toHaveBeenCalledTimes(1);
            expect(mockSendVideo).toHaveBeenCalledWith(TEST_USER_ID, TEST_MEDIA_ID, TEST_THUMB_MEDIA_ID, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('An error happened while sending message to Wechat API.');
        });

        it('given attachment message type, Video attachment type and wechat Video API success return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Video, content: {mediaId: TEST_MEDIA_ID, thumbMediaId: TEST_THUMB_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendVideo).toHaveBeenCalled();
            expect(mockSendVideo).toHaveBeenCalledTimes(1);
            expect(mockSendVideo).toHaveBeenCalledWith(TEST_USER_ID, TEST_MEDIA_ID, TEST_THUMB_MEDIA_ID, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(0);
        });

        it('given attachment message type, Music attachment type and wechat Music API error, log error and return', () => {
            mockSendMusic.mockImplementation((_id, _msg, error) => error());
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Music, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendMusic).toHaveBeenCalled();
            expect(mockSendMusic).toHaveBeenCalledTimes(1);
            expect(mockSendMusic).toHaveBeenCalledWith(TEST_USER_ID, TEST_PAYLOAD.attachments[0].content, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('An error happened while sending message to Wechat API.');
        });

        it('given attachment message type, Music attachment type and wechat Music API success return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Music, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendMusic).toHaveBeenCalled();
            expect(mockSendMusic).toHaveBeenCalledTimes(1);
            expect(mockSendMusic).toHaveBeenCalledWith(TEST_USER_ID, TEST_PAYLOAD.attachments[0].content, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(0);
        });

        it('given attachment message type, News attachment type and wechat News API error, log error and return', () => {
            mockSendNews.mockImplementation((_id, _msg, error) => error());
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.News, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendNews).toHaveBeenCalled();
            expect(mockSendNews).toHaveBeenCalledTimes(1);
            expect(mockSendNews).toHaveBeenCalledWith(TEST_USER_ID, TEST_PAYLOAD.attachments[0].content, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('An error happened while sending message to Wechat API.');
        });

        it('given attachment message type, News attachment type and wechat News API success return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.News, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendNews).toHaveBeenCalled();
            expect(mockSendNews).toHaveBeenCalledTimes(1);
            expect(mockSendNews).toHaveBeenCalledWith(TEST_USER_ID, TEST_PAYLOAD.attachments[0].content, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(0);
        });

        it('given attachment message type, MpNews attachment type and wechat MpNews API error, log error and return', () => {
            mockSendMpNews.mockImplementation((_id, _msg, error) => error());
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.MpNews, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendMpNews).toHaveBeenCalled();
            expect(mockSendMpNews).toHaveBeenCalledTimes(1);
            expect(mockSendMpNews).toHaveBeenCalledWith(TEST_USER_ID, TEST_MEDIA_ID, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('An error happened while sending message to Wechat API.');
        });

        it('given attachment message type, MpNews attachment type and wechat MpNews API success return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.MpNews, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendMpNews).toHaveBeenCalled();
            expect(mockSendMpNews).toHaveBeenCalledTimes(1);
            expect(mockSendMpNews).toHaveBeenCalledWith(TEST_USER_ID, TEST_MEDIA_ID, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(0);
        });

        it('given attachment message type, Card attachment type and wechat Card API error, log error and return', () => {
            mockSendCard.mockImplementation((_id, _msg, error) => error());
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Card, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendCard).toHaveBeenCalled();
            expect(mockSendCard).toHaveBeenCalledTimes(1);
            expect(mockSendCard).toHaveBeenCalledWith(TEST_USER_ID, TEST_PAYLOAD.attachments[0].content, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('An error happened while sending message to Wechat API.');
        });

        it('given attachment message type, Card attachment type and wechat Card API success return', () => {
            const TEST_PAYLOAD = {...TEST_ADDRESS, attachments: [{contentType: IWechatAttachmentType.Card, content: {mediaId: TEST_MEDIA_ID}}]};
            wechatConnector.send([TEST_PAYLOAD], mockDone);
            expect(mockDone).toHaveBeenCalled();
            expect(mockDone).toHaveBeenCalledTimes(1);
            expect(mockSendCard).toHaveBeenCalled();
            expect(mockSendCard).toHaveBeenCalledTimes(1);
            expect(mockSendCard).toHaveBeenCalledWith(TEST_USER_ID, TEST_PAYLOAD.attachments[0].content, expect.any(Function));
            expect(console.error).toHaveBeenCalledTimes(0);
        });
    });

    describe('onEvent', () => {
        it('sets WechatConnector handler object to provided object', () => {
            const testHandler = {testHandler: 'TEST_VALUE'};
            wechatConnector.onEvent(testHandler);
            expect(wechatConnector.handler).toEqual(testHandler);
        });
    });
});