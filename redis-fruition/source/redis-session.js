const { redisClient } = require('./redis-client')

const SESSION = require('express-session')
const REDISSTORE = require('connect-redis')(SESSION)

const REDISSESSION =
  SESSION({
    store: new REDISSTORE({ client: redisClient }),
    saveUninitialized: false,
    secret: 'secret me',
    resave: false,
  })

module.exports = REDISSESSION
