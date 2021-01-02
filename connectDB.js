require('dotenv').config()
const MongoClient = require('mongodb').MongoClient
const uri = process.env.DATABASE_CONENCT_URL


module.exports =
{
    addUser: function (req) {
        MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("games_db");
        dbo.collection("users").insertOne(req.body, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
      })
    },
    getUser: function (req,callback) { 
        MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("games_db");
        dbo.collection("users").findOne(req, function(err, res) {
          if (err) throw err;
          db.close();
          callback(res)
        });
      })
      
    }
}
