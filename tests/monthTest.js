const build = require('../app')

const test = async () => {
  const app = build()

  const response = await app.inject({
    method: 'GET',
    url: '/v1/month/2015-10'
  })

  console.log('status code: ', response.statusCode)
  console.log('body: ', response.body)
}
test()