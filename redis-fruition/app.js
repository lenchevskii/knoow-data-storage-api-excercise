const { SETcallbackC, GETcallbackAllC, GETcallbackVersionedC } = require('./source/redis-callbacks')
const { redisError, REPOSITORIES } = require('./source/general-helpers')
const { redisClient } = require('./source/redis-client')

const REDISSESSION = require('./source/redis-session')
const EXPRESS = require('express')
const MULTER = require('multer')
const R = require('ramda')

const app = EXPRESS()

app.use(MULTER().array())

app.use(redisError)

app.use(REDISSESSION)

app.put('/data/:repository',
  (req, res) => {
    const { repository } = req.params
    const { oid, version, size } = req.body
    
    const consistentObject = {
      oid: oid,
      version: Number(version),
      size: Number(size)
    }

    return redisClient.select(
      REPOSITORIES[repository],
      () => redisClient.SET(
        oid,
        JSON.stringify(consistentObject),
        SETcallbackC(consistentObject, res, R.__, R.__)
      )
    )
  }
)

app.put('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = req.params
    const { version, size } = req.body
    
    const consistentObject = {
      oid: objectID,
      version: Number(version),
      size: Number(size)
    }

    return redisClient.select(
      REPOSITORIES[repository],
      () => redisClient.APPEND(
        objectID,
        '|' + JSON.stringify(consistentObject),
        SETcallbackC(consistentObject, res, R.__, R.__)
      )
    )
  }
)

app.put('/data/:repository/:objectID/:versionID',
  (req, res) => {
    const { repository, objectID, versionID } = req.params

    return redisClient.select(
      REPOSITORIES[repository],
      () => redisClient.GET(
        objectID,
        GETcallbackVersionedC(versionID, res, R.__, R.__)
      )
    )
  }
)

app.get('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = req.params

    return redisClient.select(
      REPOSITORIES[repository],
      () => redisClient.GET(
        objectID,
        GETcallbackAllC(res, R.__)
      )
    )
  }
)

module.exports = app