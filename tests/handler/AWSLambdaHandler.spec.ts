import {AWSLambdaHandler} from "../../src";

describe('AWSLambdaHandler', () => {
    describe('handle', () => {
        const TEST_MESSAGE = 'TEST_MESSAGE';
        const TEST_HEADERS = {pragma: 'TEST_PRAGMA', X_REFERENCE: 'TEST_REFERENCE'};
        const TEST_QUERY_PARAMS = {echostr: 'TEST_ECHOSTR', timestamp: 'TEST_TIMESTAMP', nonce: 'TEST_NONCE', signature: 'TEST_SIGNATURE', openid: 'TEST_OPENID'};
        const TEST_METHOD = 'TEST_METHOD';
        let handler: any;
        let mockListenerWrapper;
        const mockCallback = jest.fn();


        beforeEach(() => {
            jest.resetModules();
            jest.resetAllMocks();
        });

        it('given req object, call listener with enriched request & response wrapper if undefined', () => {
           // Default AWS payload content
            const event = {
                queryStringParameters: {},
                body: {},
            };

            const mockListener = jest.fn();
            mockListenerWrapper = () => mockListener;

            const mockConnector = {
                listen: mockListenerWrapper
            };

            const EXPECTED_REQ_PAYLOAD = {
                headers: undefined,
                method: undefined,
                query: {
                    echostr: undefined,
                    nonce: undefined,
                    openid: undefined,
                    signature: undefined,
                    timestamp: undefined
                },
                rawBody: {}
            };

            handler = AWSLambdaHandler.handle(mockConnector);

            handler(event, {}, mockCallback);
            expect(mockListener.mock.calls[0][0]).toEqual(EXPECTED_REQ_PAYLOAD);
        });

        it('given req object, call listener with enriched request & response wrapper', () => {
            const event = {
                headers: TEST_HEADERS,
                queryStringParameters: TEST_QUERY_PARAMS,
                body: {message: 'TEST'},
                httpMethod: TEST_METHOD
            };

            const mockListener = jest.fn();
            mockListenerWrapper = () => mockListener;

            const mockConnector = {
                listen: mockListenerWrapper
            };

            const EXPECTED_REQ_PAYLOAD = {
               headers: TEST_HEADERS,
                method: TEST_METHOD,
                query: TEST_QUERY_PARAMS,
                rawBody: {message: 'TEST'}
            };
            handler = AWSLambdaHandler.handle(mockConnector);

            handler(event, {}, mockCallback);
            expect(mockListener.mock.calls[0][0]).toEqual(EXPECTED_REQ_PAYLOAD);
        });

        it('given invalid event, returns 400', () => {
            const event = {
                queryStringParameters: {},
                body: {}
            };

            const EXPECTED_RESULT = {
                body: "TEST_MESSAGE",
                headers: {
                   "Content-Type": "application/json"
                },
                isBase64Encoded: false,
                statusCode: 400
            };

            mockListenerWrapper = () => (_req: any, res: any) => res.end(TEST_MESSAGE);

            const mockConnector = {
                listen: mockListenerWrapper
            };

            handler = AWSLambdaHandler.handle(mockConnector);

            handler(event, {}, mockCallback);
            expect(mockCallback).toBeCalledWith(null, EXPECTED_RESULT);
        });

        it('given valid event calls status and returns 200', () => {
            const event = {
                headers: TEST_HEADERS,
                queryStringParameters: TEST_QUERY_PARAMS,
                body: {message: 'TEST'},
                httpMethod: TEST_METHOD
            };

            const EXPECTED_RESULT = {
                body: "TEST_MESSAGE",
                headers: {
                    "Content-Type": "application/json"
                },
                isBase64Encoded: false,
                statusCode: 200
            };

            mockListenerWrapper = () => (_req: any, res: any) => {
                res.status(200);
                res.end(TEST_MESSAGE);
            };

            const mockConnector = {
                listen: mockListenerWrapper
            };

            handler = AWSLambdaHandler.handle(mockConnector);

            handler(event, {}, mockCallback);
            expect(mockCallback).toBeCalledWith(null, EXPECTED_RESULT);
        });

        it('given valid event calls writeHead and returns 200', () => {
            const event = {
                headers: TEST_HEADERS,
                queryStringParameters: TEST_QUERY_PARAMS,
                body: {message: 'TEST'},
                httpMethod: TEST_METHOD
            };

            const EXPECTED_RESULT = {
                body: "TEST_MESSAGE",
                headers: {
                    "Content-Type": "application/json"
                },
                isBase64Encoded: false,
                statusCode: 200
            };

            mockListenerWrapper = () => (_req: any, res: any) => {
                res.writeHead(200);
                res.end(TEST_MESSAGE);
            };

            const mockConnector = {
                listen: mockListenerWrapper
            };

            handler = AWSLambdaHandler.handle(mockConnector);

            handler(event, {}, mockCallback);
            expect(mockCallback).toBeCalledWith(null, EXPECTED_RESULT);
        });
    });
});