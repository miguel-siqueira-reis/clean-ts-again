export interface GenerateToken {
  generate(data: GenerateToken.Data): GenerateToken.Response;
}

export namespace GenerateToken {
  export type Data = any;

  export type Options = {
    id: string;
    model: string;
    ability: string[];
  };

  export type Response = Promise<{
    access_token: string;
    token_type: string;
    expires_in: string;
    refresh_token: string;
  }>;
}
