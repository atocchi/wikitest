module.exports = function (fastify, opts, done) {
  const axios = require('axios');
  const moment = require("moment");
  const { promisify } = require("util");
  
  fastify.get('/month/:date', async (request, reply) => {
      //CHECK FOR VALID DATE
      let valid = moment(request.params.date, 'YYYY-MM', true).isValid()   
      if(!valid){
        reply.header('Cache-Control', 'no-store').code(400).send({message: "MALFORMED DATE: SHOULD BE YYYY-MM"});
      }
      //LOAD REDIS TO GRAB CACHE IF EXISTS
      const { redis } = fastify;
      const getAsync = promisify(redis.get).bind(redis);
      //GRAB FIRST DAY OF MONTH TO CALCULATE MONTH
      let month = moment(request.params.date, "YYYY-MM").daysInMonth();
      let first = moment(`${request.params.date}-01`, "YYYY-MM-DD").format("YYYY/MM/DD");
      //TRY CATCH BLOCK IN-CASE REDIS FAILS WILL DEFAULT TO BATCH API CALLS
      let cache = '';
      try{
        cache = await getAsync(`month${first}`);
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
        let funcArr = [];
        let dateArr = [];
        let rejectFlag = false;
        //CREATE ARRAY OF AXIOS CALLS TO BATCH
        for(let i =0; i < month; i++){
            let date = moment(first, "YYYY/MM/DD").add(i, 'd').format("YYYY/MM/DD");
            dateArr.push(date);
            funcArr.push(axios(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${date}`));
        }
        data = await Promise.allSettled(funcArr);
        for(i = 0; i < data.length; i++){
          let newMap = data[i];
          if(newMap.status === 'fulfilled'){
            newMap.value.data.items[0].articles.map( item => {
              if(hash[item.article] === undefined){ 
                hash[item.article] = {views: item.views, most: item.views, date: dateArr[i]};
              }
              else{
                if(hash[item.article].most < item.views){
                  hash[item.article] = {views: hash[item.article].views + item.views, most : item.views, date: dateArr[i]};
                }
                else{
                  hash[item.article] = {views: hash[item.article].views + item.views, most : hash[item.article].most, date: hash[item.article].date};
                }
              }
            })
          }
          else{
            rejectFlag = true;
          }
        }
        //SAVE HASH TO REDIS FOR CACHE
        if(!rejectFlag){
          console.log('SAVING HASH')
          let str = JSON.stringify({...hash}) 
          if(str == null);
          redis.set(`month${first}`, str)
        }
        if(Object.entries(hash) !== 0){
          return { ...hash };
        }
        else{
          reply.header('Cache-Control', 'no-store').code(500).send({message: "ERROR PULLING FROM WIKIAPI, POSSIBLE INVALID DATE"});
        }
      }
    })    
  done();
}

module.exports.autoPrefix = "/v1";