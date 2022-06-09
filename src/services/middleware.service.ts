// eslint-disable-next-line no-unused-vars
function errorHandler(error: any, req: any, res: any, next: any) {
  res.status(500).json(error);
}

export default errorHandler;
