export interface SaveTokenRepository {
  saveToken(
    tokenData: SaveTokenRepository.Token,
    options: SaveTokenRepository.Options,
  ): SaveTokenRepository.Response;
}

export namespace SaveTokenRepository {
  export type Token = {
    access_token: string;
    token_type: string;
    expires_in: string;
    refresh_token: string;
  };

  export type Options = {
    id: string;
    model: string;
    ability: string[];
  };

  export type Response = Promise<void>;
}
