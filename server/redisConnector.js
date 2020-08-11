const redis = require('redis')
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);
client.on('connect', function(){
    console.log('Connected to Redis');
})

client.on('error', function(err){
    console.err(err);
})

module.exports = client;