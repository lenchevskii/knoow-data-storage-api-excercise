const redis = require("redis")

const redisClient = redis.createClient()

redisClient.on("error", (error) => console.log(error, 'Here is an error occurred.'))

module.exports = { redisClient }