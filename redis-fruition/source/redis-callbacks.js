const { extractVersioned, extractAllVersions } = require('./general-helpers')

const R = require('ramda')

const GETcallbackVersioned =
  (versionID, response, error, reply) =>
    !R.isNil(error) || R.isNil(extractVersioned(reply, versionID))
      ? response.sendStatus(404)
      : response.status(200)
        .send(extractVersioned(reply, versionID))

const GETcallbackAll =
  (response, error, reply) =>
    !R.isNil(error)
      ? IO(() => response.sendStatus(404))
        .takeRight(IO(() => trace(CLICOLOR.red('\nNo object found.\n'))))
        .run()
      : response.status(200)
        .send(extractAllVersions(reply))

const SETcallback =
  (consistentObject, response, error, reply) =>
    error
      ? response.send(error)
      : response.status(201).send(consistentObject)

// Function name ends with 'C' means it uses in a curried version
module.exports = {
  SETcallbackC: R.curry(SETcallback),
  GETcallbackAllC: R.curry(GETcallbackAll),
  GETcallbackVersionedC: R.curry(GETcallbackVersioned),
}