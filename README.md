# botbuilder-wechat-connector

#### NodeJS Typescript Botbuilder Wechat Connector
[![version](https://img.shields.io/npm/v/botbuilder-wechat-connector.svg)](http://npm.im/botbuilder-wechat-connector)
[![travis build](https://img.shields.io/travis/crisboarna/botbuilder-wechat-connector.svg)](https://travis-ci.org/crisboarna/botbuilder-wechat-connector)
[![codecov coverage](https://img.shields.io/codecov/c/github/crisboarna/botbuilder-wechat-connector.svg)](https://codecov.io/gh/crisboarna/botbuilder-wechat-connector)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8d87ae38dea34aa09d0daa0ab81b81cd)](https://www.codacy.com/app/crisboarna/botbuilder-wechat-connector)
[![dependency status](https://img.shields.io/david/crisboarna/botbuilder-wechat-connector.svg)](https://david-dm.org/crisboarna/botbuilder-wechat-connector)
[![MIT License](https://img.shields.io/npm/l/botbuilder-wechat-connector.svg)](http://opensource.org/licenses/MIT)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)
[![Greenkeeper](https://badges.greenkeeper.io/crisboarna/botbuilder-wechat-connector.svg)](https://greenkeeper.io/)
[![code style](https://img.shields.io/badge/code%20style-airbnb-brightgreen.svg)](https://img.shields.io/badge/code%20style-airbnb-brightgreen.svg)

## Notice
Targets BotBuilder Framework v3.*

## Installation

```
npm install botbuilder-wechat-connector
```

## Table of Contents
* [Documentation](#documentation)
* [Features](#features)
* [Setup](#setup)
* [Sending Messages](#sending-messages)
  * [Text Message](#text-message)
  * [Image Message](#image-message)
  * [Card Message](#card-message)
  * [Music Message](#music-message)
  * [MpNews Message](#mpnews-message)
  * [News Message](#news-message)
  * [Voice Message](#voice-message)
  * [Video Message](#video-message)
* [Receiving Messages](#receiving-messages)  
  * [ShortVideo Message](#shortvideo-message)
  * [Link Message](#link-message)
  * [Location Message](#location-message)
  [Example Express](#example-express)
* [Example AWS Lambda](#example-aws-lambda)
* [Creating Wechat App](#creating-wechat-app)

## Documentation
You can find documentation [here](https://crisboarna.github.io/botbuilder-wechat-connector/)

## Features
* Microsoft Bot Framework Wechat Connector with simple setup
* Webhook Validation logic
* Supported message types:
  - Text
  - Image
  - Card
  - Music
  - MpNews
  - News
  - Voice
  - Video
  - ShortVideo
  - Link
  - Location
* Typescript code with exported types for every end-point input/output
* Vanilla server and AWS Lambda support

## Setup

Import
```javascript
const facebook = require('botbuilder-wechat-connector');
```
or
```typescript
import { WechatConnector, AWSLambdaHandler } from 'botbuilder-wechat-connector';
```

## Sending Messages

### Text Message
```typescript
bot.dialog('/', function (session) {
    session.send("Hello world!");
});
```

### Image Message
```typescript
import {Message} from 'botbuilder';
bot.dialog('/', function (session) {
    const msg = new Message(session)
                 .attachments([
        {
            contentType: IWechatAttachmentType.Image,
            content: {
                mediaId: '<MEDIA_ID>'
            }
        }
    ]);
    session.send(msg);
});
```

### Card Message
```typescript
import {Message} from 'botbuilder';
bot.dialog('/', function (session) {
    const msg = new Message(session)
                 .attachments([
        {
            contentType: IWechatAttachmentType.Card,
            content: {
                card_id: '<CARD_ID>',
                card_ext: '<CARD_EXT>'
            }
        }
    ]);
    session.send(msg);
});
```

### Music Message
```typescript
import {Message} from 'botbuilder';
bot.dialog('/', function (session) {
    const msg = new Message(session)
                 .attachments([
        {
            contentType: IWechatAttachmentType.Music,
            content: {
                title: '<TITLE>',
                description: '<DESCRIPTION>',
                url: '<URL>',
                thumb_media_id: '<MEDIA_ID>'
            }
        }
    ]);
    session.send(msg);
});
```

### MpNews Message
```typescript
import {Message} from 'botbuilder';
bot.dialog('/', function (session) {
    const msg = new Message(session)
                 .attachments([
        {
            contentType: IWechatAttachmentType.MpNews,
            content: {
                mediaId: '<MEDIA_ID>'
            }
        }
    ]);
    session.send(msg);
});
```

### News Message
```typescript
import {Message} from 'botbuilder';
bot.dialog('/', function (session) {
    const msg = new Message(session)
                 .attachments([
        {
            contentType: IWechatAttachmentType.News,
            content: {
                "title": "<TITLE>",
                "description": "<DESCRIPTION>",
                "url": "<URL>",
                "picurl": "<URL>"            
            }
        }
    ]);
    session.send(msg);
});
```

### Voice Message
```typescript
import {Message} from 'botbuilder';
bot.dialog('/', function (session) {
    const msg = new Message(session)
                 .attachments([
        {
            contentType: IWechatAttachmentType.Voice,
            content: {
                mediaId: '<MEDIA_ID>'
            }
        }
    ]);
    session.send(msg);
});
```

### Video Message
```typescript
import {Message} from 'botbuilder';
bot.dialog('/', function (session) {
    const msg = new Message(session)
                 .attachments([
        {
            contentType: IWechatAttachmentType.Video,
            content: {
                mediaId: '<MEDIA_ID>',
                thumbMediaId: '<THUMB_MEDIA_ID>'
            }
        }
    ]);
    session.send(msg);
});
```

## Receiving Messages

### ShortVideo Message
```json
{
    contentType: IWechatAttachmentType.ShortVideo,
    content: {
        mediaId: '<MEDIA_ID',
        thumbMediaId: '<THUMB_MEDIA_ID>'
    }
}
```

### Link Message
```json
{
    contentType: IWechatAttachmentType.Link,
    content: {
            title: '<TITLE>',
            description: '<DESCRIPTION>',
            url: '<URL>'
        }
}
```

### Location Message
```json
{
    contentType: IWechatAttachmentType.Link,
    content: {
        locationX: '<LOCATION_X>',
        locationY: '<LOCATION_Y>',
        scale: '<SCALE>',
        label: '<LABEL>'
    }
}
```


## Example Express
```typescript
import { WechatConnector } from 'botbuilder-wechat-connector';
import { UniversalBot } from 'botbuilder';
import { Router } from 'express';

const botConnector = new WechatConnector({
      appID: WECHAT_APP_ID,
      appSecret: WECHAT_APP_SECRET,
      appToken: WECHAT_APP_TOKEN,
    });

const bot = new UniversalBot(botConnector, <DIALOGS>);

const router = Router();
    router.post('/api/messages', <RequestHandlerParams>botConnector.listen());
    router.get('/api/messages', <RequestHandlerParams>botConnector.listen());
```

## Example AWS Lambda
**main.ts**
```typescript
import { WechatConnector, AWSLambdaHandler } from 'botbuilder-wechat-connector';
import { UniversalBot } from 'botbuilder';

const botConnector = new WechatConnector({
      appID: WECHAT_APP_ID,
      appSecret: WECHAT_APP_SECRET,
      appToken: WECHAT_APP_TOKEN,
    });

const bot = new UniversalBot(botConnector, <DIALOGS>);

export botConnector;
```
**lambda.ts**
```typescript
import {botConnector} from './main';
import {AWSLambdaHandler} from 'botbuilder-wechat-connector';
export const handler = AWSLambdaHandler.handle(botConnector)
```

## Creating Wechat App
[See Wechat Guide](https://open.wechat.com/cgi-bin/newreadtemplate?t=overseas_open/docs/mini-programs/development/brief-tutorial)