const { redisClient } = require('./redis.client')
const { trace, redisError } = require('./helper')

const SESSION = require('express-session')
const EXPRESS = require('express')
const MULTER = require('multer')

const app = EXPRESS()

const RedisStore = require('connect-redis')(SESSION)

app.use(MULTER().array())

app.use(redisError)

app.use(
  SESSION({
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: 'secret me',
    resave: false,
  })
)

app.put('/data/:repository',
  (req, res) => {
    const { repository } = req.params
    const { oid, version, size } = req.body
    const versionedOid = oid.toString().concat(`:${version}`)
    const versionedObject = {
      [versionedOid]: {
        version: version,
        size: size
      }
    }

    return redisClient.set(
      oid,
      JSON.stringify(versionedObject),
      (err, reply) => err
        ? res.send(err)
        : res.status(201).send(req.body)
    )
  }
)

app.put('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = req.params
    const { version, size } = req.body
    const versionedOid = objectID.toString().concat(`:${version}`)
    const versionedObject = {
      [versionedOid]: {
        version: version,
        size: size
      }
    }

    return redisClient.append(
      objectID,
      '|' + JSON.stringify(versionedObject),
      (err, reply) => err
        ? res.send(trace(err))
        : res.status(201).send(req.body)
    )
  }
)

app.put()

app.get('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = req.params

    return redisClient.get(
      objectID,
      (err, reply) => err
        ? res.send(err)
        : res.status(201).send(
          reply.match(/[^|.+]+/g)
            .map(stringifiedObj => JSON.parse(stringifiedObj))
        )
    )
  }
)

module.exports = app