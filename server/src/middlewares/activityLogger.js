const activityLogger = (req, _res, next) => {
  const now = new Date().toISOString();
  const { method, originalUrl } = req;
  console.log(`[${now}] ${method} ${originalUrl}`);
  next();
};

module.exports = { activityLogger };
