const fastify = require('fastify');
const path = require("path");

function build(opts={}) {
  const app = fastify(opts)

  app.register(require('@fastify/redis'), { 
    host: process.env.HOST, 
    password: process.env.PASSWORD,
    port: process.env.PORT,
  })

  app.register(require('@fastify/autoload'),{
    dir: path.join(__dirname, 'routes')
  })

  return app
}

module.exports = build