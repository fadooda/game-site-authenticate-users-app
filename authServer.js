require('dotenv').config();
const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const dbConnect = require('./connectDB');
const bcrypt = require('bcrypt');
const app = express()
//var bodyParser = require('body-parser');
//var urlencodedParser = bodyParser.urlencoded({ extended: false});

app.options('/login', cors()) // enable pre-flight request for DELETE request
app.options('/register', cors()) // enable pre-flight request for DELETE request
app.use(express.json())
//var cors = require('cors')

//app.use(cors()) // Use this after the variable declaration

var refreshTokenList = []


app.post('/login',cors(), (req,res)=>{
    //const username = req.body.username
    //const password = req.body.password
    //console.log('name '+ password)
    //db.collection.find_one({'ip': '61.228.93.0'})['history']
    console.log(process.env.REFRESH_TOKEN_SECRET)
    let user= {"userName": req.body.userName}
    dbConnect.getUser(user, async function(dbuser /* a is passed using callback */) {
        //console.log(a); // a is the object return by the database
        //console.log(dbuser)
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

            //res.json({str})
        }
    })
    //const user = { name: username}
    //const accessToken = generateAccessToken(user)
    //const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
    //refreshTokenList.push(refreshToken) //push it to the database
    //res.json({accessToken: accessToken, refreshToken: refreshToken})
    })

app.post('/register',cors(), (req,res)=>{
    //dbConnect.addUser(req)
    //console.log(req.body.userName)
    //var dbuser;
    let user= {"userName": req.body.userName}
    //use call back to prevent the server from executing the next line of codes until the database returns 
    dbConnect.getUser(user, async function(dbuser /* a is passed using callback */) {
        //console.log(dbuser); // a is the object return by the database
       //console.log(dbuser.userName)
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
            //res.json({str})
        }
    })
    })

function generateAccessToken(user)
{
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '700s'})
}


//Heroku dynamically assigns your app a port, so you can't set the port to a fixed number. Heroku adds the port to the env, so you can pull it from there. 
app.listen(process.env.PORT || 4000, ()=>{console.log(process.env.PORT)})