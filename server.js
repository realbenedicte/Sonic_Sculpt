//server.js
//
// handles uploading wav files to node.js server
// handles uploading wav filepaths, roomName, roomID, composerName to a mongodb database
// mongodb database is named 'sonic'
// mongodb collection is named 'rooms'
// handles all requests from client
// serves room information (roomName, roomID, composerName, audio in a room) to client :D
//
//Resources:
//https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
//https://docs.mongodb.com/guides/server/introduction/
//https://docs.mongodb.com/drivers/node/current/fundamentals/crud/write-operations/insert/
//https://docs.mongodb.com/drivers/node/current/fundamentals/connection/
//
//https://medium.com/gist-for-js/use-of-res-json-vs-res-send-vs-res-end-in-express-b50688c0cddf
//
//Node Modules Needed:
//(require is a Node function for importing a module)
const express = require("express");
const app = express(); // Init an Express App
const path = require("path");
//https://heynode.com/tutorial/process-user-login-form-expressjs/

const multer = require("multer"); //use multer to upload blob data
const upload = multer(); // set multer to be the upload variable
//(just like express, see above ( include it, then use it/set it up))
const fs = require("fs"); //use the file system module so we can save files
const mongodb = require("mongodb"); //our database
const MongoClient = require("mongodb").MongoClient; //The **MongoClient** class is a class that allows for making Connections to MongoDB
const port = 3000; //local host port

//didn't use sockets in this version
let io = require("socket.io")(4000, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

//Connect Node.js application to MongoDB
//work with data using the Node.js driver
MongoClient.connect("mongodb://localhost/") //MongoDB connection string - use this string to connect to 'Compass'
  .then((client) => {
    const db = client.db("sonic"); //sonic is the name of our mongodb database
    const rooms = db.collection("rooms"); //our collection in mongodb is named rooms

    //ROUTING
    //https://expressjs.com/en/starter/basic-routing.html
    //Routing refers to determining how an application responds to a client request to a particular endpoint
    //which is a URI (or path) and a specific HTTP request method (GET, POST, and so on).
    //app.METHOD(PATH, HANDLER)
    // app is an instance of express.
    // METHOD is an HTTP request method, in lowercase.
    // PATH is a path on the server.
    // HANDLER is the function executed when the route is matched.
    //
    //ROUTE FOR ROOM ID
    //app.get("/room/:roomID")
    //res.json()
    //sends a JSON response.
    //This method is identical to res.send() when an object or array is passed,
    //but it also converts non-objects to json.
    //
    // this is the get response used by initRoom()
    //send the room data corresponding to the correct room which is based on ID
    app.get("/room/:roomID", function(req, res) {
      let roomID = req.params.roomID;
      if (!roomID) {
        res.json({});
      }
      if (roomID) { //query database
        rooms.findOne({
          room: roomID
        }, function(err, room) {
          if (err) {
            res.json({});
          }
          res.json(room);
        });
      }
    });

    //app.get("/rooms/")
    //ROUTE FOR ROOMS
    //used by explore.js to get 50 rooms
    app.get("/rooms/", function(req, res) {
      var options = {
        "limit": 50,
        "sort": "room"
      }
      rooms.find({}, options).toArray(function(err, docs) {
        console.log("retrieved rooms");
        console.log(docs);
        if (err) {
          res.json([]);
        }
        res.json(docs);
      });
    });

    //socket.io
    //
    //  make sure its connected - each new user gets original id
    io.on("connect", function(socket) {
      console.log("original id:: " + socket.id);

      socket.on("init", (roomID) => {
        console.log(roomID);
      });
    });

    //FORM SUBMISSION
    //
    //composer and room name
    //WHEN YOU PRESS SAVE ROOM AFTER FILLING OUT FIELDS
    // 1. get the composer/roomName from html form
    // 2. append to formdata to be posted to server
    // 3. (in server) read the fieldNames from the previous step, just like roomID
    // 4. insert into DB

    // FILE UPLOAD
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
      console.log(req.body.roomName);
      //rooms.insertOne
      //inserts a single document into the rooms collection in MongoDB
      //MongoDB document, give field value pairs -> room and path are both fields
      rooms.insertOne({
          "room": req.body.room,
          "paths": filePaths,
          "composer": req.body.composer,
          "roomName": req.body.roomName,
        })
        .then((result) => {
          console.log(result); //console log the result
          // console.log("upload of " + `${file.originalname}` + " successful"); //console log the name of the wav file
        })
        .catch((error) => console.error(error));
    });

    //ROUTE FOR EXPLORE
    app.get('/explore', function(req, res) {
      res.sendFile(path.join(__dirname, 'app/explore.html'));
    });
    //ROUTE FOR ABOUT
    app.get('/about', function(req, res) {
      res.sendFile(path.join(__dirname, 'app/about.html'));
    });


    //https://expressjs.com/en/guide/using-middleware.html
    //This example shows a middleware function mounted on the /r/:roomID path.
    //The function is executed for any type of HTTP request on the /r/:roomIDpath.
    //https://expressjs.com/en/starter/static-files.html
    //express.static(root, [options])
    //The root argument specifies the root directory from which to serve static assets.
    // the following code to serves audio,etc.
    app.use("/r/:roomID", express.static("app")); //making room ids possible now :)
    app.use("/media", express.static("media")); //can query server for file in media
    app.use("/", express.static("app"));
    app.use("/:roomID", express.static("app")); //making room ids possible now :)

    // START SERVER
    //https://expressjs.com/en/starter/hello-world.html
    //This app starts a server and listens on port 3000 for connections.
    app.listen(port, () => {
      console.log(`SonicSculpt app listening at http://localhost:${port}`);
    });
  })
  .catch(console.error);
