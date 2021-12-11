//AudioRecorder Class
//CLASS CREATED BY MAXIME :)
//
let AudioRecorder = class {
  constructor() {
    this.isRecording = false;
    this.on_record_stop = this.on_record_stop.bind(this);
    this.blobs = [null, null, null, null];
  }
  //methods for this class
  //
  init_mic_recorder(stream) {
    mic_recorder = new MediaRecorder(stream, {
      audioBitsPerSecond: 64000
    });
    mic_recorder.ondataavailable = function(e) {
      rec_chunks.push(e.data); //writing data to a buffer
    };
    mic_recorder.onstop = this.on_record_stop;
  }

  //server communication!
  //
  //upload the recorded wav file to the data base :)
  on_record_stop(e) {
    this.save_rec_blob();
    this.handle_store_full_buffer(); //audio buffer stuff
  }

  //server communication!
  //
  //upload the recorded wav file to the data base :)
  on_save_room(e) {
    this.upload_blobs(); // uncomment if you want to stop the uploading process :)
  }

  end_record() {
    mic_recorder.stop();
    if (verbose) {
      console.log("recording stopped");
    }
  }

  delete_rec_blob() {
    window.URL.revokeObjectURL(rec_url);
  }

  init_audio_stream() {
    var self = this;
    if (navigator.mediaDevices) {
      console.log("getUserMedia supported.");
      navigator.mediaDevices
        .getUserMedia({
          audio: true
        })
        .then(function(stream) {
          self.init_mic_recorder(stream);
        })
        .catch(function(err) {
          console.log("Encountered the getUserMedia error: " + err);
        });
    } else {
      console.log("getUserMedia not supported on your browser!");
    }
  }

  begin_record() {
    mic_recorder.start();
    if (verbose) {
      console.log("recording started");
    }
  }

  handle_rec_press(current_grain_id) {
    if (this.isRecording) {
      this.end_record(current_grain_id);
      this.isRecording = false;
    } else {
      this.isRecording = true;
      var playing = get_grains_playing();
      if (playing) {
        kill_grains(playing); //stop playing any grain while recording
      }
      this.delete_rec_blob();
      this.begin_record();
    }
  }

  /* Function: save_rec_blob
  //notes on Blob
  /*The Blob object represents a blob,
  /*which is a file-like object of immutable,
  /*raw data; they can be read as text or binary data,
  /*or converted into a ReadableStream so its methods can be used for processing the data.
  */
  //make a blob, create a path to it
  //blob - binary data thing -
  save_rec_blob() {
    // rec_blob = new Blob(rec_chunks, { type: "audio/ogg; codecs=opus" });
    let blob = new Blob(rec_chunks, {
      type: "audio/ogg; codecs=opus"
    });
    rec_blob = blob;
    rec_chunks = []; //in contstants it is null, here we change to array
    rec_url = window.URL.createObjectURL(rec_blob);
    //create array to store the sound blob
    //find id of the blob
    this.blobs[current_grain_id] = blob;
    console.log('curretn g id', current_grain_id);
  }

  get_audio_buffer_source(out_node) {
    var buf_src = context.createBufferSource(); //audio is audio context constant
    buf_src.buffer = full_buffer;
    buf_src.connect(out_node);
    return buf_src;
  }

  //server communication!
  //
  upload_blobs() { //to server
    //SERVER STUFF
    console.log('upload_blob')

    let roomNameValue = document.getElementById("roomName").value;
    let composerValue = document.getElementById("composer").value;

    let formdata = new FormData(); //create a from to of data to upload to the server
    let sound_id = roomID;

    if (!roomID) {
      sound_id = makeid(4);
      roomID = sound_id;
    }
    //to the field of room, put the correct roomID
    formdata.append("room", `${roomID}`);
    formdata.append("composer", `${composerValue}`);
    formdata.append("roomName", `${roomNameValue}`);

    for (let i = 0; i < this.blobs.length; i++) {
      let blob = this.blobs[i];
      //name, value, filename
      formdata.append(`blobs`, blob, `${sound_id}-${i}.wav`);
    }

    //POST ENDPOINT ~!~
    // Now we can send the blob to a server...
    var serverUrl = "/upload"; //we've made a POST endpoint on the server at /upload
    //build a HTTP POST request
    var request = new XMLHttpRequest();
    request.open("POST", serverUrl);
    request.onload = function(evt) {
      if (request.status == 200) {
        console.log("successful upload of " + `${sound_id}.wav`);
        // call function to display gui info + put grains into save mode
        //if you get 200 it means these values were saved so we can display them
        let roomDetails = document.getElementById('roomDetailsID');
        let roomNameDiv = document.createElement("div");
        roomNameDiv.setAttribute("id", "roomNameDisplay");
        let composerDiv = document.createElement("div");
        composerDiv.setAttribute("id", "composerDisplay");
        roomNameDiv.innerText = `Room Name: ${roomNameValue}`;
        composerDiv.innerText = `Composer: ${composerValue}`;
        roomDetails.textContent = roomDetails.textContent + `RoomID: ${roomID}`;
        roomDetails.appendChild(roomNameDiv);
        roomDetails.appendChild(composerDiv);
        for (let i = 0; i < grains.length; i++) {
          // grain_uis[i].disable_record_and_delete();
          grains[i].ui.removeButton.classList.add("hidden");
          grains[i].ui.recordButton.classList.add("hidden");
          grains[i].stop(); // make disable recording and delete
        }
      } else {
        console.log("got error ", evt);
      }
    };
    request.send(formdata);
  }

  //AUDIO BUFFER STUFF
  //
  //https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
  handle_store_full_buffer() {
    var reader = new FileReader();
    reader.onloadstart = function() {
      if (verbose) {
        console.log("beginning buffer load");
      }
    };
    reader.onloadend = function() {
      let arr_buf = reader.result;
      context //context is our audio context created in contstants :)
        .decodeAudioData(arr_buf)
        .then(function(data) {
          full_buffer = data;
          console.log(data); //data is our audio buffer :)
          console.log(data.duration); // can find duration (how long our recording is in seconds)
          if (current_grain_id !== null) {
            grains[current_grain_id].full_buffer = data;
            // grain_uis[current_grain_id].handle_spawn_grain();
            grains[current_grain_id].play();
            current_grain_id = null;
          }
          console.log("initiated buffer on grain: ", current_grain_id);
        })
        .catch(function(err) {
          console.log("Encountered the decodeAudioData error: " + err);
        });
      if (verbose) {
        console.log("finished buffer load");
      }
    };
    reader.readAsArrayBuffer(rec_blob);
  }
};
