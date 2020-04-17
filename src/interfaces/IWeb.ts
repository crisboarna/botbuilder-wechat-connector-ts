export interface IWebRequest {
  body: any;
  weixin: any;
  headers: {
    [name: string]: string,
  };
  on(event: string, ...args: any[]): void;
}

export interface IWebResponse {
  end(): this;
  send(status: number, body?: any): this;
  send(body: any): this;
  status(code: number): this;
}
