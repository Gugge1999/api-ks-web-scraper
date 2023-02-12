import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line no-unused-vars
function errorHandler(
  error: string,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(500).json(error);
}

export default errorHandler;
