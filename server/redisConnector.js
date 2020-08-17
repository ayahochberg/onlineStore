const redis = require('redis')
const REDIS_PORT = process.env.PORT || 6379;
const { asyncRedis } = require('@toomee/async-redis');

const rClient = redis.createClient(REDIS_PORT);
const client = asyncRedis(rClient);

module.exports = client;