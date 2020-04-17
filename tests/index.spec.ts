describe('botbuilder-wechat-connector-ts', () => {
   it('exports WechatConnector class', () => {
      const connector = require('../src/index');
      expect(connector.WechatConnector).toBeDefined();
   });

   it('exports AWSLambdaHandler class', () => {
      const connector = require('../src/index');
      expect(connector.AWSLambdaHandler).toBeDefined();
   });
});