/* File: main.js
 * -----------------------
 * This is the main file for the Grains4u web app. The aim of this web app is to
 * be a simple, intuitive sandbox toy for learning about and playing with
 * granular synthesis. Using the app, a user will be able to record a live sample
 * of audio from their microphone input, and then start adding grains on top
 * of that sample. They can use the GrainUI interface to extend, shorten, or slide the
 * grain around on the sample. At any point, the user can record a new live audio sample,
 * and the state of the app is reset.
 *
 * Important Sources:
 * - https://goo.gl/NIerhh
 * - https://goo.gl/nZF0x5
 * - https://goo.gl/bcIYL7
 * - https://goo.gl/VaV8kX
 * - https://goo.gl/86PNFT
 * - https://goo.gl/RVYeG5 - ObjectURL manpage
 * - https://goo.gl/tNB9Bf - setting up localhost
 * - https://goo.gl/t7ivz4 - working with clock timing
 * - https://goo.gl/iMWzDQ - Music 220b granular lecture
 *
 * List of Future Bug Fixes/ Future Features on Asana Project
 */

let current_grain_id = null;
let isRecording = false;
/* Function: init
 * --------------
 * This is the master initialization function for the script. It
 * first initializes the buttons, then initializes the rest of the
 * audio node business. It is called when the HTML page loads.
 */
function init() {
  init_buttons();
  init_audio_stream();
  init_grains();
  init_interface();
  init_doc_listeners();
}

/* Function: init_buttons
 * ----------------------
 * This function creates new GButton objects for the record and play
 * buttons in the HTML document, then intializes click event listeners
 * for both of these buttons.
 */
function init_buttons() {
  //rec_button = new GButton("rec_stop", handle_rec_press, 0);
}

/* Function: init_button_listener
 * ------------------------------
 * This initializes a new Event Listener, listening for clicks on
 * whichever button is passed into it. When the button is clicked,
 * the button's "click_func" function fires.
 */
function init_button_listener(btn) {
  btn.button.addEventListener('click', function () { btn.click_func(btn); });
}

/* Function: get_grains_playing
 * ----------------------------
 * This function gathers the indexes of all the grains currently playing.
 * If there are one or more currently active grains, an array of all active
 * indices is returned. Else, null is returned.
 */
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
 * When called, this function kills all of the grains with the indexes
 * passed into it via the playing array. It first stops the audio of
 * the grain, then resets the UI display of the grain box to its
 * uninitialized state.
 */
function kill_grains(playing) {
  for (var i = 0; i < playing.length; i++) {
     grains[playing[i]].stop(); //stop playing any grain while recording
    // grain_uis[playing[i]].handle_remove_grain();
  }
}

/* Function: handle_rec_press
 * --------------------
 * This function handles the pressing of the record button.
 * if the recording is currently happening, it is ended. If it
 * is not, then playback of the sound is stopped (if it is going),
 * and the recording is begun.
 */
function handle_rec_press() {
  if (isRecording) {
    end_record();
    isRecording = false;
  } else {
    isRecording =true;
    var playing = get_grains_playing()
    if (playing) {
      kill_grains(playing);
    }
    delete_rec_blob();
    begin_record();
  }
}

/* Function: end_record
 * ----------------------
 * This ends the recording process, and changes the activity boolean of
 * the record button to reflect this.
 */
function end_record() {
  mic_recorder.stop();
  if (verbose) { console.log("recording stopped"); }

  unblock_app();
  // rec_button.is_active = 0;
}

/* Function: begin_record
 * ----------------------
 * This begins the recording process, and changes the activity boolean of
 * the record button to reflect this.
 */
function begin_record() {
  mic_recorder.start();
  if (verbose) { console.log("recording started"); }
  // document.getElementById("rec_stop").style.backgroundColor = "red";
  // document.getElementById("rec_stop").innerHTML = "Stop";
  block_app();
  // rec_button.is_active = 1;
}

/* Function: delete_rec_blob
 * -----------------------
 * This revokes the url of the previously-used audio recording, in
 * preparation of a new one about to be created.
 */
function delete_rec_blob() {
  window.URL.revokeObjectURL(rec_url);
}

/* Function: save_rec_blob
 * -----------------------
 * This function fires every time the mic_recorder object finishes
 * recording. It first creates a new audio blob, then gets an object
 * url for this blob. It then passes this object url to the Audio
 * contructor to make a new HTMLAudioElement object. If this object
 * has already been initialized, then the source value of the Audio
 * element is replaced.
 */
function save_rec_blob() {
  rec_blob = new Blob(rec_chunks, { 'type': 'audio/ogg; codecs=opus' });
  rec_chunks = [];
  rec_url = window.URL.createObjectURL(rec_blob);
  if (full_audio) {
    full_audio.src = rec_url;
  } else {
    full_audio = new Audio(rec_url);
  }

  // audios.push(new Audio(rec_url))
}


/* Function: get_audio_buffer_source
 * -----------------------------------
 * This function creates and returns an AudioBufferSource object that
 * can play the current full buffer.
 */
function get_audio_buffer_source(out_node) {
  var buf_src = context.createBufferSource();
  buf_src.buffer = full_buffer;
  buf_src.connect(out_node);
  return buf_src;
}

/* Function: handle_store_full_buffer
 * -----------------------------------
 * This function stores the AudioBuffer object containing the data for
 * the current audio recording. It it passed an ArrayBuffer object, and
 * processes it with the decodeAudioData function of the AudioContext.
 *
 * This function uses a FileReader instance to feed the raw data from
 * the full recording blob into an ArrayBuffer object, which we can
 * use later to create playable AudioBuffer objects.

 * ALSO, it inits the grain buffers
 */
function handle_store_full_buffer() {
  var reader = new FileReader();
  reader.onloadstart = function () { if (verbose) { console.log("beginning buffer load"); } }
  reader.onloadend = function () {
    arr_buf = reader.result;
    context.decodeAudioData(arr_buf).then(function (data) {
      full_buffer = data;
      if (current_grain_id !== null) {
        grains[current_grain_id].full_buffer = data;
        grain_uis[current_grain_id].handle_spawn_grain();
        grains[current_grain_id].play();
        current_grain_id = null
      }
      console.log("initiated buffer on grain: ", current_grain_id)
    }).catch(function (err) {
      console.log("Encountered the decodeAudioData error: " + err);
    });
    if (verbose) { console.log("finished buffer load"); }
  }
  reader.readAsArrayBuffer(rec_blob)
}

/* Function: init_mic_recorder
 * ---------------------------
 * Initializes the MediaRecorder mic_recorder object. Links it to the
 * audio stream, and declares callback functions for when data is
 * available from the MediaRecorder API, and what to do when the
 * MediaRecorder object is done recording.
 */
function init_mic_recorder(stream) {
  mic_recorder = new MediaRecorder(stream, { audioBitsPerSecond: 64000 });
  mic_recorder.ondataavailable = function (e) {
    rec_chunks.push(e.data);
  };
  mic_recorder.onstop = function (e) {
    save_rec_blob();
    handle_store_full_buffer();
  };
}

/* Function: init_audio_stream
 * ---------------------------
 * This initializes all variables and AudioNodes related to capturing
 * the audio stream. It first checks to see if grabbing the audio stream
 * is possible. If so, it passes the stream to init_mic_recorder, so that
 * it can be linked to the MediaRecorder. It catches any errors/ MediaStream
 * incompatibilities with the browser.
 *
 * Code Sources: https://goo.gl/etOCTm, https://goo.gl/5X2Fzt
 */
function init_audio_stream() {
  if (navigator.mediaDevices) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      init_mic_recorder(stream);
    }).catch(function (err) {
      console.log("Encountered the getUserMedia error: " + err);
    });
  } else {
    console.log('getUserMedia not supported on your browser!');
  }
}

/* Function: link_grains_to_uis
 * ----------------------------
 * This function links each GrainUI object to its respective Grain object.
 * It does this by assigning a reference of each GrainUI to a member variable in
 * its proper Grain object, and vice versa. This must happen in the initialization
 * phase of the application, so that GrainUI's and Grain's can reference each other
 * while running.
 */
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

/* Function: init_app_div
 * ---------------------
 * This function centers the app div in the current browser window. It set the
 * width, height, and x-y coordinates of the top-left corner of the app div.
 * The width and height are calculated according to two constants from the
 * constants.js document.
 */
function center_app() {
  //set app div width, height
  app.style.width = window.innerWidth * APP_WIDTH_RATIO + "px";
  app.style.height = window.innerHeight * APP_HEIGHT_RATIO + "px";
  //set app div x, y
  app.style.position = "absolute";
  app.style.left = (window.innerWidth - app.offsetWidth) / 2.0 + "px";
//  var rec_stop_height = get_css_val(REC_STOP_ID, "height", true);
  //app.style.top = ((window.innerHeight - app.offsetHeight) / 2.0 - rec_stop_height) + "px";
}

// function init_rec_stop_wrapper() {
//   document.getElementById(REC_STOP_ID).style.width = window.innerWidth + "px";
// }

/* Function: init_app_div
 * ---------------------
 * This function initializes two divs on the page, an app_container div, which
 * acts as a general wrapper for the app, and an app div, which contains the app.
 * The app div is made to be the child of the app_container div, and both are
 * appended to the page. Finally, the app div is centered within the window.
 */
function init_app_div() {
  var app_container = document.createElement('div');
  app_container.id = "app_container";
  app = document.createElement('div');
  app.id = APP_ID;

  document.getElementById("all").appendChild(app_container);
  app_container.appendChild(app);

  center_app();
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
  return (app_height / (NUM_GRAINS * 1.0)) - (2 * GRAIN_BOX_MARGIN);
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
  posit[1] = (g_ind * (g_box_height + (2 * GRAIN_BOX_MARGIN)));
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
    grain_uis.push(new GrainUI(i, gb_posit[0], gb_posit[1], gb_width, gb_height, COLORS[i]))
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
  }
  else if (event.target.className == "remove_text") {
    var g_ind = get_g_ind_from_id(event.target.id);
    grains[g_ind].stop();
    grain_uis[g_ind].handle_remove_grain();
  }
 else if (event.target.className == "pause_text") {
  var g_ind = get_g_ind_from_id(event.target.id);
  //toggle for play/pause
  if(grains[g_ind].grain_on){
    grains[g_ind].stop();
  }
  else {
    grains[g_ind].play();
  }
  //grain_uis[g_ind].handle_remove_grain();
}

  else if (event.target.className == "record_text") {
    if (isRecording) {
      // isRecording = false;
      event.target.innerHTML = "record";
      console.log("ending record ", current_grain_id)
      handle_rec_press()
      return;
    }

    // isRecording = true;
    event.target.innerHTML = "stop"; //change text
    var g_ind = get_g_ind_from_id(event.target.id);
    console.log("got record id ", g_ind)
    current_grain_id = g_ind;
    console.log("beginning record ", g_ind)
    handle_rec_press()
  }
}

/* Function: handle_mouse_move
 * ---------------------------
 * This handles a mouse move event. If a grain rectangle is being transformed,
 * then the new coordinates of the mouse are passed to the handle_new_mouse_coords
 * event in the grain being transformed.
 */
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


/* Function: init_doc_listeners
 * ----------------------------
 * This function initiates the mouse up, down, and move listeners that act
 * on the entire page. They are mainly used for recognizing when the user
 * interacts with a component on the page, and makes sure the correct
 * page component handles the interaction.
 */
function init_doc_listeners() {
  document.addEventListener("mousemove", handle_mouse_move, false);
  document.addEventListener("mousedown", handle_mouse_down, false);
  document.addEventListener("mouseup", handle_mouse_up, false);
}
