const server = require('./app')({
  logger: true
})

//START SERVER
const start = async () => {
  try {
    await server.listen({port: 3000})
    
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()
