const {
  SETcallback,
  DELcallback,
  GETcallbackAll,
  APPENDcallback,
  GETcallbackVersioned,
} = require('./source/redis-callbacks')

const { redisError, REPOSITORIES, trace } = require('./source/general-helpers')
const { redisClient } = require('./source/redis-client')

const REDISSESSION = require('./source/redis-session')
const EXPRESS = require('express')
const CRYPTO = require('crypto')
const R = require('ramda')

const app = EXPRESS()

app.use(EXPRESS.raw({ type: 'json' }))

app.use(redisError)

app.use(REDISSESSION)

app.put('/data/:repository',
  (req, res) => {
    const { repository } = req.params
    const { name } = JSON.parse(req.body)
    const SECRET = 'Secret key 👽'

    const oid = CRYPTO.createHmac('sha256', SECRET)
      .update(name)
      .digest('hex')

    const consistentObject = {
      oid: oid,
      version: 1,
      size: Buffer.byteLength(oid),
      name: { name: 'Copernicus' }
    }

    return redisClient.SELECT(
      REPOSITORIES[repository],
      () => redisClient.SET(
        oid,
        JSON.stringify(consistentObject),
        SETcallback(consistentObject, res, R.__, R.__)
      )
    )
  }
)

// SHOULD BE REPAIRED
app.put('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = trace(req.params)

    const consistentObject = {
      oid: objectID,
      version: 'version',
      size: 1,
      name: { name: 'Copernicus' }
    }

    return redisClient.SELECT(
      REPOSITORIES[repository],
      () => redisClient.APPEND(
        objectID,
        '|' + JSON.stringify(consistentObject),
        APPENDcallback(consistentObject, res, R.__, R.__)
      )
    )
  }
)

app.put('/data/:repository/:objectID/:versionID',
  (req, res) => {
    const { repository, objectID, versionID } = req.params

    return redisClient.SELECT(
      REPOSITORIES[repository],
      () => redisClient.GET(
        objectID,
        GETcallbackVersioned(versionID, res, R.__, R.__)
      )
    )
  }
)

app.get('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = req.params

    return redisClient.SELECT(
      REPOSITORIES[repository],
      () => redisClient.GET(
        objectID,
        GETcallbackAll(res, R.__)
      )
    )
  }
)

app.delete('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = req.params

    return redisClient.SELECT(
      REPOSITORIES[repository],
      () => redisClient.DEL(
        objectID,
        DELcallback(res, R.__, R.__)
      )
    )
  }
)

app.put('*',
  (req, res) => res.status(404).send(trace(('PUT route not found.')))
)

app.get('*',
  (req, res) => res.status(404).send(trace('GET route not found.'))
)

module.exports = app