export class AWSLambdaHandler {
  public static handle(connector: any) {
    const listener = connector.listen();

    const handler = (event:any, _context:any, callback:any) => {
      const response = {
        isBase64Encoded: false,
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statusCode: 400 }),
      };

      const reqWrapper: any = {
        headers: event.headers,
      };

      const resWrapper: any = {
        status: (code: number) => {
          response.statusCode = code;
          return resWrapper;
        },
        end: (message: string) => {
          response.body = message;
          callback(null, response);
        },
        writeHead: (code: number) => response.statusCode = code,
      };

      reqWrapper.method = event.httpMethod;
      reqWrapper.query = {
        echostr: event.queryStringParameters.echostr,
        timestamp: event.queryStringParameters.timestamp,
        nonce: event.queryStringParameters.nonce,
        signature: event.queryStringParameters.signature,
        openid: event.queryStringParameters.openid,
      };

      reqWrapper.rawBody = event.body;

      listener(reqWrapper, resWrapper);
    };
    return handler;
  }
}
