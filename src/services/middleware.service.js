// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  res.status(500).json({ message: error });
}

export default errorHandler;
