
//Node Modules Needed
const express = require('express')
const path = require('path');
const app = express()
const multer  = require('multer') //use multer to upload blob data
const upload = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))
const fs = require('fs'); //use the file system so we can save files
const mongodb = require('mongodb'); //our database
const MongoClient = require('mongodb').MongoClient;

const port = 3000 //local host port

// https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html

MongoClient.connect("mongodb://localhost/")
  .then(client => {
    const db = client.db('sonic')
    const rooms = db.collection('rooms')

    // FILE UPLOAD ( SHOUld BE OUR SAVE STATE )
    app.post('/upload', upload.single('soundBlob'), function (req, res, next) {
      console.log(req.file); // see what got uploaded

      //media folder stores all the wav files
      let uploadLocation = __dirname + '/media/' + req.file.originalname // where to save the file to. make sure the incoming name has a .wav extension
      fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer))); // write the blob to the server as a file
      res.sendStatus(200); //send back that everything went ok

      rooms.insertOne({
        "room": req.body.room,
        "path": "/media/" + req.file.originalname//media folder stores all the wav files
      })
      .then(result => {
        console.log(result)
      })
      .catch(error => console.error(error))
    })

app.use('/', express.static('app'));
    app.use('/:roomID', express.static('app')); //making room ids possible now :)

    // START SERVER
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
    })
  })
  .catch(console.error)
