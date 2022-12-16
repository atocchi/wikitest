# wikitest
wikipedia wrapper

STEPS TO SETUP
1. Install NODE 17 + and NPM 8 +
2. Install redis v7 + 
3. Redis will require you to create a password, remember this, you will need it later
4. start redis server with `redis-server`
5. note the port, default is `6379`
6. Setup .env file with vars, HOST, PORT and PASSWORD, this will be used for Redis your HOST is your localhost 
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
        "<articleName>": { "views": int, "most": int, "date": string },
        ...
    ]
```
`articleName` will be a key value that can be converted into a string, or kept as a key in order to use the hashmap
`view` is an int value that is the total view for the week/month
`most` is an int value that is the highest day of views for a given week/month
`date` is a date formatted string that indicates the day for a given article that had the highest views