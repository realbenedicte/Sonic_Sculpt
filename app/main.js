//main.js
//
//each grain box gets its own id
let current_grain_id = null;
let audioRecorder = new AudioRecorder(); //making a new instance of the audioRecorder Class
let currentRoom = null;
let roomID = null;
//defining various buttons
let createRoomButton = document.getElementById("createRoomID"); //define create room button
let homePageButton = document.getElementById("homeButton");
let formElement = document.getElementById("saveForm");
let submitButton = document.getElementById("submit2");
let roomDetails = document.getElementById("roomDetailsID");
let audioFilePaths = null;

//When page loads -> call the init functions
window.addEventListener("load", (event) => {
  console.log("window loaded.");
  initRoom();
  createRoomButton.addEventListener("click", createRoom);
});

//query the server/db to see if the url typed into the website matches a room !!!!
//if it does load up that room, if it doesn't load the homepage with createroom
//we also need to get values from array db
//
//mongo db document example:
//_id:xxxxxxxx
//room: "e8Rp"
// paths:Array
// 0:"/media/e8Rp-0.wav"
// 1: "/media/e8Rp-1.wav"
// 2:"/media/e8Rp-2.wav"
// 3:"/media/e8Rp-3.wav"
// composer:"maxime"
// roomName: "testing"

//initRoom()
//if the room exists in the server it means a user has saved that room
//so show the room !!!
// and call initGrainsFromServer(audioFilePaths);
//which loads up correct audio files corresponding to the room
function initRoom() {
  let r_id = window.location.hash.substring(1);
  console.log(window.location);
  console.log(r_id);
  if (r_id === "") {
    homePageCreateRoom();
    return;
  }
  //getting the room from server
  var url = `/room/${r_id}`;
  var req = new XMLHttpRequest();
  req.responseType = "json";
  req.open("GET", url, true);
  req.onload = function () {
    var roomFromServer = req.response;
    if (roomFromServer && roomFromServer.room) {
      homePageCreateRoom(roomFromServer.room);
      //need to load this files into the audio buffer somehow
      let audioFilePaths = roomFromServer.paths;
      let composer = roomFromServer.composer; //getting composer from server
      let roomName = roomFromServer.roomName; //getting roomname from server
      //
      //consolelogs
      console.log("got audio file paths", audioFilePaths);
      console.log("got room from server", roomFromServer);
      console.log("got roomName from server", roomName);
      console.log("got composer from server", composer);
      //populate grain channels with correct audio file paths
      //
      initGrainsFromServer(audioFilePaths);
      //Show composer, room name and room id in the gui
      //we got these elements from the server because they are in the rooms object
      let roomNameDiv = document.createElement("div");
      roomNameDiv.setAttribute("id", "roomNameDisplay");
      let composerDiv = document.createElement("div");
      composerDiv.setAttribute("id", "composerDisplay");
      roomNameDiv.innerText += `Room Name: ${roomName}`;
      composerDiv.innerText += `Composer: ${composer}`;
      roomDetails.textContent = roomDetails.textContent + `RoomID: ${r_id}`;
      roomDetails.appendChild(roomNameDiv);
      roomDetails.appendChild(composerDiv);
      //connect to socket only in saved room
      //disabled sockets for this version
      // let clientSocket = io.connect('http://localhost:4000');
      // clientSocket.on('connect', function() {
      //   console.log("connected");
      //   clientSocket.emit("init", r_id);
      //   clientSocket.on('disconnect', () => {
      //     console.log("disconnected");
      //   });
      // });
      if (document.getElementById("saveRoomId")) {
        var saveTest2 = document.getElementById("saveRoomId");
        saveTest2.style.display = "none";
      }
      roomDetails.style.display = "flex";
    } else {
      homePageCreateRoom();
    }
  };
  req.send(null);
}
//
//main simple homepage
function homePageCreateRoom(r_id = null) {
  if (r_id) {
    audioRecorder.init_audio_stream();
    init_grains();
    init_interface();
    initGrainUiWithRoom();
    createRoomButton.style.display = "none"; //hide create room button
    createSaveButton();
    console.log("homepage created.");
    formElement.style.display = "none"; //hide form
    roomDetails.style.display = "none";
    return;
  }
  createRoomButton.style.display = "block"; //show the create room button
  console.log("homepage created.");
  createRoomButton.style.display = "block"; //show the create room button
  formElement.style.display = "none"; //hide form
  roomDetails.style.display = "none";
  if (document.getElementById("app_div")) {
    var divTest = document.getElementById("app_div");
    divTest.style.visibility = "hidden";
  }
  if (document.getElementById("saveRoomId")) {
    var saveTest2 = document.getElementById("saveRoomId");
    saveTest2.style.display = "none";
  }
}

function initGrainsFromServer(audioFilePaths) {
  for (let i = 0; i < audioFilePaths.length; i++) {
    initGrain(i, audioFilePaths[i]);
  }
}

function initGrain(id, path) {
  //let source = context.createBufferSource();
  let request = new XMLHttpRequest();
  request.open("GET", path, true);
  request.responseType = "arraybuffer";
  request.onload = function () {
    let audioData = request.response;
    //need to send this response to the channel buffer
    context.decodeAudioData(
      audioData,
      function (buffer) {
        grains[id].full_buffer = buffer;
        grains[id].stop();
      },
      function (e) {
        "Error with decoding audio data" + e.error;
      }
    );
  };
  request.send();
}

//creates a new room and initializes it
//TO DO: clear old room -- calling this again creates an old room on top of other ones
function createRoom() {
  roomID = makeid(4);
  window.location.hash = `${roomID}`;
  audioRecorder.init_audio_stream();
  init_grains();
  init_interface();
  createRoomButton.style.display = "none"; //hide create room button
  createSaveButton();
}

function createSaveButton() {
  let saveButton = document.getElementById("saveRoomId");
  saveButton.style.display = "block";
  saveButton.addEventListener("click", saveButtonClick);
}

//when you click save:
//bring up dialog that lets you enter in: roomname, composer and tags
//in a form
//send this form to the server !!!!
function saveButtonClick() {
  console.log("save clicked");
  //PAUSE ALL AUDIO
  //show form only if you've uploaded audio to all 4 channels !
  for (let i = 0; i < grains.length; i++) {
    if (!grains[i].full_buffer) {
      alert("please record 4 audio files");
      return;
    }
  }
  formElement.style.display = "block";
  let saveButton = document.getElementById("saveRoomId");
  saveButton.style.display = "none";
  var divTest = document.getElementById("app_div");
  divTest.style.visibility = "hidden";
  submitButton.addEventListener("click", submitRoomDetails);
  //turn off all grains!!
  for (let i = 0; i < grains.length; i++) {
    grains[i].stop();
  }
  console.log("stopped all grains");
}

//send form details to the server here!!!
//post the room to the explore page
//make the audio not deleteable/recordable at this point (just pause/play/move)
//audioRecorder.on_save_room(); makes a post request to the server to upload json data and wav files to the server
function submitRoomDetails() {
  //first show the main app again but needs to now have details from the form!
  var divTest = document.getElementById("app_div");
  formElement.style.display = "none";
  divTest.style.visibility = "visible";
  roomDetails.style.display = "flex";
  //Save the audio and the room id to the server!!!!!
  audioRecorder.on_save_room();
}

function get_grains_playing() {
  var playing = [];
  for (var i = 0; i < NUM_GRAINS; i++) {
    if (grains[i].grain_on) {
      playing.push(i);
    }
  }
  if (playing.length > 0) {
    return playing;
  } else {
    return null;
  }
}

function kill_grains(playing) {
  for (var i = 0; i < playing.length; i++) {
    grains[playing[i]].stop(); //stop playing any grain while recording
  }
}

function link_grains_to_uis() {
  for (var i = 0; i < grains.length; i++) {
    grains[i].ui = grain_uis[i];
    grain_uis[i].grain = grains[i];
  }
}

/* Function: init_grains
 * ---------------------
 * This function initializes the Grain objects in the grain array, as well
 * as the corresponding GrainUI objects for each grain.
 */
function init_grains() {
  grains = new Array();
  for (var i = 0; i < NUM_GRAINS; i++) {
    grains.push(new Grain(i));
  }
}

//add app_div
//add title
//
function init_app_div() {
  app = document.createElement("div");
  app.id = APP_ID;
  document.getElementById("all").appendChild(app);
  // var divTest = document.getElementById('app_div');
}


/* Function: init_interface
 * ------------------------
 * This function initializes the whole app interface. It initializes the app
 * container div, all of the GrainUI interface objects, links these objects
 * to their Grain objects, draws the grain interfaces, and then blocks
 * app interaction (until a recording occurs).
 */
function init_interface() {
  // init app div
  init_app_div();
  grain_uis = new Array();
  for (var i = 0; i < NUM_GRAINS; i++) {
    grain_uis.push(createSlider(i));
  }
  link_grains_to_uis();
}

//array to hold the colors we want for each grain channel
const sliderColors = ["red", "green", "orange", "purple"];

//function that creates sliders and creates callbacks for if a slider box is being dragged
function createSlider(id) {
  let sliderEl = document.createElement("div");
  sliderEl.id = `slider-${id}`;
  sliderEl.className = `slider off ${sliderColors[id]}`;
  app.appendChild(sliderEl);
  let slider = noUiSlider.create(sliderEl, {
    start: [40, 60],
    connect: true,
    margin: 10,
    behaviour: "drag",
    range: {
      min: 0,
      max: 100,
    },
  });
  slider.on("end", onDragEnd);
  slider.grain = null;
  console.log(`created slider ${id} `, slider);

  let noAudioEl = document.createElement("div");
  let inner_msg = document.createElement("h3");
  inner_msg.className = "no_audio";
  inner_msg.innerText = "No Audio";
  noAudioEl.appendChild(inner_msg);
  sliderEl.appendChild(noAudioEl);

  // record div
  let recordEl = document.createElement("div");
  recordEl.className = "record_div";
  recordEl.id = `record_div_${id}`;
  sliderEl.appendChild(recordEl);

  // play pause div
  let playEl = document.createElement("div");
  playEl.className = "pause_div hidden";
  playEl.id = `pause_div_${id}`;
  sliderEl.appendChild(playEl);

  // remove grain div
  let removeEl = document.createElement("div");
  removeEl.id = `remove_div_${id}`;
  removeEl.className = "remove_div hidden";
  sliderEl.appendChild(removeEl);
  slider.recordButton = recordEl;
  slider.pauseButton = playEl;
  slider.removeButton = removeEl;
  slider.noAudio = noAudioEl;
  slider.update_playstate = updatePlaystate;
  playEl.addEventListener("click", onPause);
  recordEl.addEventListener("click", onRecord);
  removeEl.addEventListener("click", onRemove);
  return slider;
}

function updatePlaystate(playing = false) {
  //defaults to false
  if (playing) {
    this.pauseButton.classList.remove("playing");
  } else {
    this.pauseButton.classList.add("playing");
  }
}

function onRemove(e) {
  const g_ind = get_g_ind_from_id(e.target.id);
  const grain = grains[g_ind];
  grain.stop();
  grain.buffer = null;
  grain.full_buffer = null;
  grain.oldStart = 0;
  grain.oldEnd = 0;
  grain.ui.noAudio.classList.remove("hidden");
  grain.ui.removeButton.classList.add("hidden");
  grain.ui.pauseButton.classList.add("hidden");
  grain.ui.recordButton.classList.remove("hidden");
  grain.ui.target.classList.add("off");
  console.log("grain-deleted");
}

//callback for if a slider box is dragged when it stops dragging
//refresh play (to do with granular synthesis and audio playback)
function onDragEnd(e) {
  console.log("drag end ! ", e, this);
  this.grain.refresh_play();
}

//on pause stop playing the grains for that particular channel
function onPause(e) {
  var g_ind = get_g_ind_from_id(e.target.id);
  //toggle for play/pause
  if (grains[g_ind].grain_on) {
    grains[g_ind].stop();
  } else {
    grains[g_ind].play();
  }
}
//Make sure grain ui is pretty
function initGrainUiWithRoom() {
  for (let i = 0; i < grain_uis.length; i++) {
    const grainUi = grain_uis[i];
    console.log(" got grain ui", grainUi)
    grainUi.target.classList.remove("recording");
    grainUi.target.classList.remove("hidden");
    grainUi.pauseButton.classList.remove("hidden");
    grainUi.removeButton.classList.add("hidden");
    grainUi.recordButton.classList.add("hidden");
    grainUi.noAudio.classList.add("hidden");
    grainUi.target.classList.remove("off");
  }
}
//Record function
//get the grain id of channel
//update gui
//call audioRecorder function handle_rec_press()!
function onRecord(e) {
  console.log(e);
  const g_ind = get_g_ind_from_id(e.target.id);
  const grainUi = grain_uis[g_ind];
  current_grain_id = g_ind;
  if (audioRecorder.isRecording) {
    e.target.classList.remove("recording");
    console.log("ending record ", current_grain_id);
    audioRecorder.handle_rec_press(current_grain_id);
    e.target.classList.add("hidden");
    grainUi.pauseButton.classList.remove("hidden");
    grainUi.removeButton.classList.remove("hidden");
    grainUi.noAudio.classList.add("hidden");
    grainUi.target.classList.remove("off");
    return;
  }
  e.target.classList.add("recording");
  console.log("got record id ", g_ind);
  console.log("beginning record ", g_ind);
  audioRecorder.handle_rec_press(current_grain_id);
}


/* Function: get_g_ind_from_id
 * ---------------------------
 * This function takes in the ID of a GrainUI's HTML element and
 * returns the index (in the grains array) of the Grain object that
 * element belongs to.
 */
function get_g_ind_from_id(str) {
  var ind_str = str.charAt(str.length - 1);
  return parseInt(ind_str);
}
