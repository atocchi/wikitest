module.exports = function (fastify, opts, done) {
  const axios = require('axios');
  const moment = require("moment");
  const { promisify } = require("util");
  
  fastify.get('/week/:date', async (request, reply) => {
      //CHECK FOR VALID DATE
      let valid = moment(request.params.date, 'YYYY-MM-DD', true).isValid()   
      if(!valid){
        reply.header('Cache-Control', 'no-store').code(400).send({message: "MALFORMED DATE: SHOULD BE YYYY-MM-DD"});
      }
      //LOAD REDIS TO GRAB CACHE IF EXISTS
      const { redis } = fastify;
      const getAsync = promisify(redis.get).bind(redis);
      //GET START OF WEEK IN ORDER TO CALCULATE WHOLE WEEK
      let day = moment(request.params.date, "YYYY-MM-DD").day()
      let firstDay = moment(request.params.date, "YYYY-MM-DD").subtract(day, 'd').format("YYYY/MM/DD");
      //TRY CATCH BLOCK IN-CASE REDIS FAILS WILL DEFAULT TO BATCH API CALLS
      let cache = '';
      try{
        cache = await getAsync(firstDay);
      }
      catch(err){
        console.log(err);
      }
      if(cache){
        console.log('FOUND HASH');
        return JSON.parse(cache);
      }
      else{
        let hash = {};
        for(let i =0; i < 7; i++){
            let date = moment(firstDay, "YYYY/MM/DD").add(i, 'd').format("YYYY/MM/DD");
            try{
              const data = await axios(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${date}`);
              data.data.items[0].articles.map( item => {
                  if(hash[item.article] === undefined){ 
                  hash[item.article] = {views: item.views, most: item.views, date: date};
                  }
                  else{
                  if(hash[item.article].most < item.views){
                      hash[item.article] = {views: hash[item.article].views + item.views, most : item.views, date: date};
                  }
                  else{
                      hash[item.article] = {views: hash[item.article].views + item.views, most : hash[item.article].most, date: hash[item.article].date};
                  }
                  }
              })
            }
            catch(err){
              //RETURN PARTIAL HASH  FOR INCOMPLETE WEEK; DO NOT CACHE
              if(hash !== {}){
                return { ...hash};
              }
              //LOG ERROR FOR CLOUDWATCH ETC. BUT DO NOT SEND TO USER, DO NOT CACHE ERROR
              console.log(err);
              reply.header('Cache-Control', 'no-store').code(500).send({message: "ERROR PULLING FROM WIKIAPI, POSSIBLE INVALID DATE"});
            }
        }
        //SAVE HASH TO REDIS FOR CACHE
        let str = JSON.stringify({...hash}) 
        redis.set(firstDay, str)
        return { ...hash }
      }
    })
  done();
}

module.exports.autoPrefix = "/v1";