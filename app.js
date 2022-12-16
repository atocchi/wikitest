const fastify = require('fastify');
const path = require("path");
require("dotenv").config();

function build(opts={}) {
  const app = fastify(opts)
  app.register(require('@fastify/redis'), { 
    host: process.env.HOST, 
    port: process.env.PORT,
  })

  app.register(require('@fastify/autoload'),{
    dir: path.join(__dirname, 'routes')
  })

  return app
}

module.exports = build