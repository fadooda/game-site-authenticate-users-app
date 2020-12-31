require('dotenv').config();
const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const dbConnect = require('./connectDB');
const bcrypt = require('bcrypt');
const app = express()


app.options('/login', cors()) // enable pre-flight request for DELETE request
app.options('/register', cors()) // enable pre-flight request for DELETE request
app.use(express.json())


var refreshTokenList = []


app.post('/login',cors(), (req,res)=>{

    console.log(process.env.REFRESH_TOKEN_SECRET)
    let user= {"userName": req.body.userName}
    dbConnect.getUser(user, async function(dbuser /* a is passed using callback */) {

        if(dbuser==null)
        {
            console.log("User doesn't Exist")
            res.sendStatus(404)
        }else{
            let str=dbuser
            const compare = await bcrypt.compare(req.body.password, dbuser.password);
            if(compare)
            {
                const accessToken = generateAccessToken(user)
                const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
                res.json({accessToken: accessToken, refreshToken: refreshToken})
            }else{
                str+= " Incorrect password"
                res.sendStatus(401)
            }
        }
    })

    })

app.post('/register',cors(), (req,res)=>{

    let user= {"userName": req.body.userName}

    //use call back to prevent the server from executing the next line of codes until the database returns 
    dbConnect.getUser(user, async function(dbuser /* a is passed using callback */) {

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

app.get('/games/authenticate',cors(), authenticateToken, (req,res)=>{
    res.json(true)
})
        
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

function generateAccessToken(user)
{
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '700s'})
}


//Heroku dynamically assigns your app a port, so you can't set the port to a fixed number. Heroku adds the port to the env, so you can pull it from there. 
app.listen(process.env.PORT || 4000, ()=>{console.log(process.env.PORT)})