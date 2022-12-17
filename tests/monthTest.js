const { test } = require('tap');
const build = require('../app');
const moment = require("moment");

test('requests the "/v1/month" route', async t => {
  t.plan(4)
  const app = build()
 
  t.teardown(() => app.close())
  
  const response = await app.inject({
    method: 'GET',
    url: '/v1/month/2017-04'
  })
  t.equal(response.statusCode, 200, 'returns a status code of 200')

  let date = moment().format('YYYY-MM');
  let future = moment(date, 'YYYY-MM').add(1,'M').format("YYYY-MM");

  const response2 = await app.inject({
    method: 'GET',
    url: `/v1/month/${date}`
  })
  t.equal(response2.statusCode, 200, 'returns a status code of 200, for current month')

  const response3 = await app.inject({
    method: 'GET',
    url: `/v1/month/${future}`
  })
  t.equal(response3.statusCode, 500, 'returns a status code of 500, for future month')

  const response4 = await app.inject({
    method: 'GET',
    url: `/v1/month/hotdogs`
  })
  t.equal(response4.statusCode, 400, 'returns a status code of 400, for gibberish')


})