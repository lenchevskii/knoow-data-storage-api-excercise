const { IO } = require("monet")

const R = require('ramda')
const CLICOLOR = require('cli-color')

/**
 * Add a repositry that corresponds to the Redis number of table.
 */
const REPOSITORIES = {
  cats: 0,
  dogs: 1,
  // ... whatever
}

const trace = (x, ...comment) =>
  IO(() => console.log(x, ...comment))
    .takeRight(IO(() => x))
    .run()

const redisError = (err, req, res, next) =>
  res.headersSent
    ? next(err)
    : res.status(500)

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

    return consistentObject = {
      oid: oid,
      version: Number(version),
      size: Number(size)
    }
  } catch (e) {
    trace(CLICOLOR.red('No version found.'))
  }
}

/**
 * 
 * @param {String} reply String obtained from Redis
 * @returns Array of all object versions
 */
const extractAllVersions = (reply) => {
  try {
    return reply
      .match(/[^|.+]+/g)
      .map(stringifiedObj => JSON.parse(stringifiedObj))
  } catch (e) {
    trace(CLICOLOR.red('No object found.'))
  }
}

module.exports = {
  trace,
  redisError,
  REPOSITORIES,
  extractVersioned,
  extractAllVersions,
}
