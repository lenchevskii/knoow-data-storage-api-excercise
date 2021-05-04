const { IO } = require("monet")
const CLICOLOR = require('cli-color')

const R = require('ramda')

const trace = (x, ...comment) =>
  IO(() => console.log(x, ...comment))
    .takeRight(IO(() => x))
    .run()

const redisError = (err, req, res, next) =>
  res.headersSent
    ? next(err)
    : res.status(500)

/**
 * Add a repositry that corresponds to the Redis number of table.
 */
const repositories = {
  cats: 0,
  dogs: 1,
  // ... whatever
}

/**
 * 
 * @param {String} reply String obtained from Redis
 * @param {String} versionID Necessary object version
 * @returns Versioned object
 */
const extractVersioned = (reply, versionID) => {
  try {
    const { oid, version, size } = extractAllVersions(reply)
      .filter(versionedObj => !R.isNil(R.prop(versionID, versionedObj)))
      .pop()[versionID]

    return { oid: oid, version: Number(version), size: Number(size) }
  } catch (e) {
    trace(CLICOLOR.red('\nNo version found.\n'))
  }
}

/**
 * 
 * @param {String} reply String obtained from Redis
 * @returns Array of all object versions
 */
const extractAllVersions = (reply) =>
  reply
    .match(/[^|.+]+/g)
    .map(stringifiedObj => JSON.parse(stringifiedObj))

module.exports = {
  trace,
  redisError,
  repositories,
  extractVersioned,
  extractAllVersions,
}
