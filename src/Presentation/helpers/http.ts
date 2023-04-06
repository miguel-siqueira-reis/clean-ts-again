export const BadRequest = (error: Error) => {
  return {
    status: 400,
    body: {
      error: error.message,
    },
  };
};

export const ServerError = (error: Error) => {
  return {
    status: 500,
    body: {
      error: 'Ocorreu um erro inesperado',
    },
  };
};

export const Ok = (data: any) => {
  return {
    status: 200,
    body: data,
  };
};
