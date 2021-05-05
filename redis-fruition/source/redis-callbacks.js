const { extractVersioned, extractAllVersions, trace } = require('./general-helpers')

const R = require('ramda')

const GETcallbackVersioned =
  (versionID, response, error, reply) =>
    error || R.isNil(extractVersioned(reply, versionID))
      ? response.sendStatus(404)
      : response.status(200)
        .send(extractVersioned(reply, versionID))

const GETcallbackAll =
  (response, error, reply) =>
    error || R.isNil(extractAllVersions(reply))
      ? response.sendStatus(404)
      : response.status(200)
        .send(
          R.head(extractAllVersions(reply))['name']
        )

const SETcallback =
  (consistentObject, response, error, reply) =>
    error
      ? response.sendStatus(404)
      : response.status(201).send(consistentObject)


const DELcallback =
  (response, error, reply) =>
    error
      ? response.sendStatus(404)
      : response.sendStatus(200)

module.exports = {
  SETcallback: R.curry(SETcallback),
  DELcallback: R.curry(DELcallback),
  APPENDcallback: R.curry(SETcallback),
  GETcallbackAll: R.curry(GETcallbackAll),
  GETcallbackVersioned: R.curry(GETcallbackVersioned),
}