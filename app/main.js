//main.js
//
//each grain box gets its own id
let current_grain_id = null;
let audioRecorder = new AudioRecorder(); //making a new instance of the audioRecorder Class

//defining various buttons
let createRoomButton = document.getElementById("createRoomID"); //define create room button
let aboutButton = document.getElementById("about-button");
let overlayElement = document.getElementById("myNav");
let homePageButton = document.getElementById("homeButton");
let formElement = document.getElementById('saveForm');
let submitButton = document.getElementById('submit');
let roomDetails = document.getElementById('roomDetailsID');
//When page loads -> call the init function
window.addEventListener("load", (event) => {
  console.log("window loaded.");
  init();
});

//load homepage
function init() {
homePageCreateRoom();
init_doc_listeners();
}

function init_doc_listeners() {
  document.addEventListener("mousemove", handle_mouse_move, false);
  document.addEventListener("mousedown", handle_mouse_down, false);
  document.addEventListener("mouseup", handle_mouse_up, false);
  homePageButton.addEventListener("click", homePageCreateRoom);
  //everytime you click the createRoomButton it creates a new room...
  createRoomButton.addEventListener("click", createRoom);
  aboutButton.addEventListener("click", openAbout);
}

function homePageCreateRoom(){
  console.log('homepage created.');
  overlayElement.style.display = "none"; // hide the about button text
  createRoomButton.style.display = "block"; //show the create room button
  closeAbout();
  formElement.style.display = "none"; //hide form
  roomDetails.style.display = 'none';
  if(document.getElementById('app_div')){
    var divTest = document.getElementById('app_div');
    divTest.style.visibility = "hidden";
  }
  if(document.getElementById('saveRoomId')){
    var saveTest2 = document.getElementById('saveRoomId');
    saveTest2.style.display = "none";
  }
}


//creates a new room and initializes it
//TO DO: clear old room -- calling this again creates an old room on top of other ones
function createRoom(){
  audioRecorder.init_audio_stream();
  init_grains();
  init_interface();
  createRoomButton.style.display = "none";  //hide create room button
  createSaveButton();
}

function openAbout() {
  document.getElementById("myNav").style.display = "block";
  console.log('open');
  createRoomButton.style.display = "none"; //hide create room button
  aboutButton.style.color = "blue";
}

function closeAbout() {
  overlayElement.style.display = "none";
  console.log('close');
  aboutButton.style.color = "black";
}

function createSaveButton(){
  let saveButton = document.getElementById("saveRoomId");
  saveButton.style.display = 'block';
  saveButton.addEventListener("click", saveButtonClick)
}

//when you click save:
//bring up dialog that lets you enter in: roomname, composer and tags
//in a form
//send this form to the server !!!!
function saveButtonClick(){
console.log('save clicked');
//PAUSE ALL AUDIO
//show form
formElement.style.display = 'block';
let saveButton = document.getElementById("saveRoomId");
saveButton.style.display = "none";
var divTest = document.getElementById('app_div');
divTest.style.visibility = "hidden";
submitButton.addEventListener("click", submitRoomDetails);
//turn off all grains!!
for (let i = 0; i < grains.length; i++) {
  grains[i].stop();
}
console.log('stopped all grains');
}

//send form details to the server here!!!
//post the room to the explore page
//make the audio not deleteable/recordable at this point (just pause/play/move)
function submitRoomDetails(){
  //first show the main app again but needs to now have details from the form!
  var divTest = document.getElementById('app_div');
  formElement.style.display = 'none';
  divTest.style.visibility = 'visible';
  roomDetails.style.display = 'inline-block';
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

/* Function: kill_grains
 * ---------------------
 */
function kill_grains(playing) {
  for (var i = 0; i < playing.length; i++) {
    grains[playing[i]].stop(); //stop playing any grain while recording
    // grain_uis[playing[i]].handle_remove_grain();
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
  var divTest = document.getElementById('app_div');
}

/* Function: get_css_val
 * ---------------------
 * This is a general purpose function for retrieving the final, calculated value
 * of an object's css property on the page. The function takes in the id string
 * of the object (elem_id), the name of the property that will be queried (val_name)
 * and a boolean indicating whether the return value should be processed into a float
 * or not (return_as_num).
 */
function get_css_val(elem_id, val_name, return_as_num) {
  var elem = document.getElementById(elem_id);
  var style_val = window.getComputedStyle(elem).getPropertyValue(val_name);
  if (return_as_num) return parseFloat(style_val);
  return style_val;
}

/* Function: get_grain_box_height
 * ------------------------------
 * This function returns the height that each grain box should be
 * in the application. The quantity is returned as a number variable
 * with pixels as the unit.
 */
function get_grain_box_height() {
  var app_height = get_css_val(APP_ID, "height", true);
  return app_height / (NUM_GRAINS * 1.0) - 2 * GRAIN_BOX_MARGIN;
}

/* Function: get_grain_box_width
 * -----------------------------
 * This function returns the width that each grain box should be
 * in the application. The quantity is returned as a number variable
 * with pixels as the unit.
 */
function get_grain_box_width() {
  return get_css_val(APP_ID, "width", true);
}

/* Function: get_grain_box_posit
 * -----------------------------
 * This calculates the x and y coordinates of the top-left corner of
 * each grain box on the page. The coordinate pair depends on the
 * index of the grain box, and the height of the window. The coordinate pair
 * is returned in the posit array.
 */
function get_grain_box_posit(g_ind) {
  var posit = [];
  //get x val
  posit[0] = 0;
  //get y val
  var g_box_height = get_grain_box_height();
  posit[1] = g_ind * (g_box_height + 2 * GRAIN_BOX_MARGIN);
  return posit;
}

/* Function: init_interface
 * ------------------------
 * This function initializes the whole app interface. It initializes the app
 * container div, all of the GrainUI interface objects, links these objects
 * to their Grain objects, draws the grain interfaces, and then blocks
 * app interaction (until a recording occurs).
 */
function init_interface() {
  //init_rec_stop_wrapper();
  // init app div
  init_app_div();
  //init grain_uis
  grain_uis = new Array();
  for (var i = 0; i < NUM_GRAINS; i++) {
    //calc GrainUI init values (box_x, box_y, box_width, box_height)
    var gb_height = get_grain_box_height();
    var gb_width = get_grain_box_width();
    var gb_posit = get_grain_box_posit(i);
    grain_uis.push(
      new GrainUI(i, gb_posit[0], gb_posit[1], gb_width, gb_height, COLORS[i])
    );
  }

  // link grains to ui's
  link_grains_to_uis();
  draw_init_grain_uis();
  block_app();
}

/* Function: draw_init_grain_uis
 * -----------------------------
 * This function initializes the display elements of the GrainUI
 * objects.
 */
function draw_init_grain_uis() {
  for (var i = 0; i < NUM_GRAINS; i++) {
    grain_uis[i].draw_init();
  }
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

/* Function: unblock_app
 * ---------------------
 * This function unblocks the entire app, allowing interactions
 * with the grains. This is used once a recording is made by the
 * user and the grains can be played.
 */
function unblock_app() {
  for (var i = 0; i < NUM_GRAINS; i++) {
    grain_uis[i].unblock_me();
  }
}

/* Function: block_app
 * -------------------
 * This function makes the entire app blocked, and prevents interactions
 * with the grains. This is used for when the page is initially loaded and
 * no recording is in the buffer, or when a recording is happening.
 */
function block_app() {
  for (var i = 0; i < NUM_GRAINS; i++) {
    grain_uis[i].block_me();
  }
}

/* Function: handle_mouse_move
 * ---------------------------
 * This function handles any mouse down event on the page. There are
 * four cases that require handling: If the text "add a grain" is clicked
 * on an inactive grain, then the grain is initiated. If a grain rectangle
 * is clicked, the correct grain number is retrieved, and transformation
 * on that grain is initiated. If the Record button is pressed, recording begins.
 * If the remove button is pressed, the grain is killed.
 */
function handle_mouse_down(event) {
  if (event.target.className == "g_rect") {
    event.preventDefault();
    var g_ind = get_g_ind_from_id(event.target.id);
    grain_uis[g_ind].handle_grain_rect_click(event.clientX);
    g_changing = g_ind;
  } else if (event.target.className == "remove_text") {
    var g_ind = get_g_ind_from_id(event.target.id);
    grains[g_ind].stop();
    grain_uis[g_ind].handle_remove_grain();
  } else if (event.target.className == "pause_text") {
    var g_ind = get_g_ind_from_id(event.target.id);
    //toggle for play/pause

    if (grains[g_ind].grain_on) {
      grains[g_ind].stop();
    } else {
      grains[g_ind].play();
    }
    //grain_uis[g_ind].handle_remove_grain();
  } else if (event.target.className == "record_text") {
    if (audioRecorder.isRecording) {
      // audioRecorder.isRecording = false;
      event.target.innerHTML = "record";
      console.log("ending record ", current_grain_id);
      audioRecorder.handle_rec_press();
      return;
    }

    // audioRecorder.isRecording = true;
    event.target.innerHTML = "stop"; //change text
    var g_ind = get_g_ind_from_id(event.target.id);
    console.log("got record id ", g_ind);
    current_grain_id = g_ind;
    console.log("beginning record ", g_ind);
    audioRecorder.handle_rec_press();
  }
}


function handle_mouse_move(event) {
  if (g_changing > -1) {
    event.preventDefault();
    grain_uis[g_changing].handle_new_mouse_coords(event.clientX);
  }
}

/* Function: handle_mouse_up
 * -------------------------
 * This function handles a mouse up event. If one of the grain rectangles
 * is being transformed, this is stopped, and the g_changing boolean is
 * switched to reflect this.
 */
function handle_mouse_up(event) {
  if (g_changing > -1) {
    grain_uis[g_changing].handle_grain_rect_release();
    g_changing = -1;
  }
}
