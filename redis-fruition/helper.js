const { IO } = require("monet")

const trace = (x, ...comment) =>
  IO(() => console.log(x, ...comment))
    .takeRight(IO(() => x))
    .run()

const redisError = (err, req, res, next) =>
  res.headersSent
    ? next(err)
    : res.status(500)

const extractParams = (params) => ({ repository } = params)

const extractBody = (body) => ({ oid, version, size } = body)

module.exports = { trace, redisError }
