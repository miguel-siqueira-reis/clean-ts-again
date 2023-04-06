export interface Controller {
  handle(request: Controller.Request): Controller.Response;
}

export namespace Controller {
  export type Request = {
    body: any;
  };
  export type Response = Promise<{
    body: any;
    status: number;
  }>;
}
