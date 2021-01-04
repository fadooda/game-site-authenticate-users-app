require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const dbConnect = require('./connectDB')
const bcrypt = require('bcrypt')
const app = express()
const PORT = process.env.PORT ||  process.env.PORT_DEV

app.options('/login', cors()) // enable pre-flight request for login request
app.options('/register', cors()) // enable pre-flight request for register request
app.use(express.json())



/**
 * Route: /login
 * 
 */
app.post('/login',cors(), (req,res)=>{ 

    let user= {"userName": req.body.userName} //pull out user name from the http request sent by the client
    
    console.log(":::Loging in User:::")
    dbConnect.getUser(user, async function(dbuser /* dbuser is the user name return by the monogodb*/) {
        if(dbuser==null)
        {
            console.log(`User::: ${user} doesn't Exist`)
            res.sendStatus(404)
        }else{
            let str=''
            const compare = await bcrypt.compare(req.body.password, dbuser.password); //check encrypted password from the mongodb database with the user input
            if(compare)
            {
                const accessToken = generateAccessToken(user)
                const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
                res.json({accessToken: accessToken, refreshToken: refreshToken}) //send json formatted objects of the access token generate
            }else{
                str=`Incorrect password for user::: ${dbuser}`
                console.log(str)
                res.sendStatus(401)
            }
        }
    })

    })

/**
 * Route: /register
 * Note: use call back to prevent the server from executing the next line of codes until the database returns 
 */
app.post('/register',cors(), (req,res)=>{

    let user= {"userName": req.body.userName}

    dbConnect.getUser(user, async function(dbuser /* dbuser is the user name return by the monogodb*/) {
        if(dbuser==null)
        {
            console.log(":::Registering User:::")
            req.body.password = await bcrypt.hash(req.body.password, 10)
            dbConnect.addUser(req)
            res.sendStatus(204)
        }else{
            let str="user: " + dbuser.userName +" already exists"
            console.log(str)
            res.sendStatus(409)
        }
    })
    })

    
/*
Route get function, it takes the client request and checks if the token is valid 
*/
app.get('/games/authenticate',cors(), authenticateToken, (req,res)=>{
    res.json(true)
})

/**
 * authenticateToken: A function that Authenticates a jwt token, to ensure that both the user has logged in and that the user's access token is still not expired
 * 
 * AuthenticateToken function will strip the authorization header from the request 
 * Then check the token against the ACCESS_TOKEN_SECRET to verify that the token is vaild
 * 
 * if the token is valid move to the next middlewear function 
 * else return 401 (unauthorized) status
 */
function authenticateToken(req,res,next)
{
     const authHeader = req.headers['authorization']
     const token = authHeader && authHeader.split(' ')[1]
     if(token == null) 
     {
         return res.sendStatus(401)
     }

     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
         if(err) return res.sendStatus(401)
         req.user = user 
         next()
     })
}

//generate a signed jwt token
function generateAccessToken(user)
{
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION_TIME}s`})
}


//Heroku dynamically assigns your app a port, so you can't manually set the port to a fixed number. Heroku adds the port to the env, so you can pull it from there. 
app.listen(PORT, ()=>console.log(`Server has started on port: ${PORT}`))