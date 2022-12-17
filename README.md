# wikitest
wikipedia wrapper

STEPS TO SETUP
1. Install NODE 17 + and NPM 8 +
2. Install redis v7 + 
3. start redis server with `redis-server`
4. note the port, default is `6379`
5. Setup .env file with vars, `HOST`and `PORT`, this will be used for Redis your HOST is your localhost
6. Add var for `SERVER_PORT`, I used `3000` for my default 
7. Run `npm i` in root directory, `/wikitest/`
8. Run `npm start` to start server, you should see fastify intiate logging, base urlshould be `http://localhost:3000/`

ENDPOINTS

For **month**
>URL: /v1/month/:YYYY-MM

For **week**
>URL: /v1/month/:YYYY-MM-DD

Both endpoints should return the following JSON
```
    [
        {"articleName": string, "views": int, "most": int, "date": string },
        ...
    ]
```
`articleName` will be a string value that is the name of the article
`view` is an int value that is the total view for the week/month
`most` is an int value that is the highest day of views for a given week/month
`date` is a date formatted string that indicates the day for a given article that had the highest views