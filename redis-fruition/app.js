const {
  trace,
  redisError,
  repositories,
  extractVersioned,
  extractAllVersions
} = require('./helper')

const { redisClient } = require('./redis.client')

const CLICOLOR = require('cli-color')
const SESSION = require('express-session')
const EXPRESS = require('express')
const MULTER = require('multer')
const R = require('ramda')
const { IO } = require('monet')

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
    const versionedObject = {
      [version]: req.body
    }
    const consistentObject = {
      oid: oid,
      version: Number(version),
      size: Number(size)
    }


    return redisClient.select(
      repositories[repository],
      () => redisClient.set(
        oid,
        JSON.stringify(versionedObject),
        (err, reply) => err
          ? res.send(err)
          : res.status(201).send(consistentObject)
      )
    )
  }
)

app.put('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = req.params
    const { version, size } = req.body
    const versionedObject = {
      [version]: req.body
    }
    const consistentObject = {
      oid: objectID,
      version: Number(version),
      size: Number(size)
    }

    return redisClient.select(
      repositories[repository],
      () => redisClient.append(
        objectID,
        '|' + JSON.stringify(versionedObject),
        (err, reply) => R.isNil(err)
          ? res.sendStatus(404)
          : res.status(201).send(consistentObject)
      )
    )
  }
)

app.put('/data/:repository/:objectID/:versionID',
  (req, res) => {
    const { repository, objectID, versionID } = req.params

    return redisClient.select(
      repositories[repository],
      () => redisClient.get(
        objectID,
        (err, reply) => R.isNil(err)
          ? res.sendStatus(404)
          : res.status(200)
            .send(extractVersioned(reply, versionID))
      )
    )
  }
)

app.get('/data/:repository/:objectID',
  (req, res) => {
    const { repository, objectID } = req.params

    return redisClient.select(
      repositories[repository],
      () => redisClient.get(
        objectID,
        (err, reply) => R.isNil(err)
          ? IO(() => res.sendStatus(404))
            .takeRight(IO(() => trace(CLICOLOR.red('\nNo object found.\n'))))
            .run()
          : res.status(200)
            .send(extractAllVersions(reply))
      )
    )
  }
)

module.exports = app