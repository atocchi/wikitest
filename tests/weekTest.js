const { test } = require('tap');
const build = require('../app');
const moment = require("moment");


test('requests the "/v1/week" route', async t => {
  t.plan(4)
  const app = build()
 
  t.teardown(() => app.close())

  const response = await app.inject({
    method: 'GET',
    url: '/v1/week/2018-11-11'
  })
  t.equal(response.statusCode, 200, 'returns a status code of 200')

  //Remove 1 day to account for early first day of week not being uploaded to wikipedia Yet
  let date = moment().subtract(1, 'd').format('YYYY-MM-DD');
  let future = moment(date, 'YYYY-MM-DD').add(14,'d').format("YYYY-MM-DD");

  const response2 = await app.inject({
    method: 'GET',
    url: `/v1/week/${date}`
  })
  t.equal(response2.statusCode, 200, 'returns a status code of 200, for current week')

  const response3 = await app.inject({
    method: 'GET',
    url: `/v1/week/${future}`
  })
  t.equal(response3.statusCode, 500, 'returns a status code of 500, for two weeks in the future')

  const response4 = await app.inject({
    method: 'GET',
    url: `/v1/week/hamburgers`
  })
  t.equal(response4.statusCode, 400, 'returns a status code of 400, for gibberish')
})