//server.js
//currently handles uploading wav files to a mongodb database
//
//Resources:
//https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
//https://docs.mongodb.com/guides/server/introduction/
//https://docs.mongodb.com/drivers/node/current/fundamentals/crud/write-operations/insert/
//https://docs.mongodb.com/drivers/node/current/fundamentals/connection/
//
//TO DO:
//figure out how to delete documents in mongodb
//
//Node Modules Needed:
//(require is a Node function for importing a module)
const express = require("express");
const app = express(); // Init an Express App
const path = require("path");
const multer = require("multer"); //use multer to upload blob data
const upload = multer(); // set multer to be the upload variable
//(just like express, see above ( include it, then use it/set it up))
const fs = require("fs"); //use the file system module so we can save files
const mongodb = require("mongodb"); //our database
const MongoClient = require("mongodb").MongoClient; //The **MongoClient** class is a class that allows for making Connections to MongoDB
//
//constants:
const port = 3000; //local host port

//Connect Node.js application to MongoDB
//work with data using the Node.js driver
MongoClient.connect("mongodb://localhost/") //MongoDB connection string - use this string to connect to 'Compass'
  .then((client) => {
    const db = client.db("sonic"); //sonic is the name of our mongodb database
    const rooms = db.collection("rooms"); //our collection in mongodb is named rooms


    app.get("/room/:roomID", function(req, res) {
      let roomID = req.params.roomID;
      if (!roomID) {
        res.json({});
      }

      if (roomID) { //query database
        rooms.findOne({
          room: roomID
        }, function(err, room) {
          if(err){
            res.json({});
          }
          res.json(room);
        });
      }
    });
    // FILE UPLOAD
    //( SHOUld BE OUR SAVE STATE )
    //app.post() (.post() method of the express app object)
    //
    //app.post(path, callback [, callback ...])
    app.post("/upload", upload.array("blobs", 4), function(req, res, next) {
      // console.log("this is the request.file "+`${req.file}`);
      //media folder stores all the wav files
      let filePaths = [];
      console.log(req.files);
      for (let i = 0; i < req.files.length; i++) {
        let file = req.files[i];
        let uploadLocation = __dirname + "/media/" + file.originalname; // where to save the file to. make sure the incoming name has a .wav extension
        filePaths.push("/media/" + file.originalname) //media folder stores all the wav files);
        fs.writeFileSync(
          uploadLocation,
          Buffer.from(new Uint8Array(file.buffer))); // write the blob to the server as a file
      }
      res.sendStatus(200); //send back that everything went ok
      //rooms.insertOne
      //inserts a single document into the rooms collection in MongoDB
      //MongoDB document, give field value pairs -> room and path are both fields
      rooms.insertOne({
          "room": req.body.room,
          "paths": filePaths
        })
        .then((result) => {
          console.log(result); //console log the result
          // console.log("upload of " + `${file.originalname}` + " successful"); //console log the name of the wav file
        })
        .catch((error) => console.error(error));
    });

    app.use("/", express.static("app"));
    app.use("/:roomID", express.static("app")); //making room ids possible now :)

    // START SERVER
    app.listen(port, () => {
      console.log(`SonicSculpt app listening at http://localhost:${port}`);
    });
  })
  .catch(console.error);
