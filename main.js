//RIGHT NOW:
// going to implement a delete-previous-recording feature, to be space
// efficient

//ON THE LIST:
/* - CHECK OUT reader.readAsArrayBuffer(blob)
 * - delete previous recording when recording a new one (line 106)
 * - responsive play/pause button, isn't clickable if no recording yet
 *
 *
 */

/* File: main.js
 * -----------------------
 * This is going to contain the javascript-working-gubbins for the Grains4u
 * Grainulator, but right now it is only a stub page that records an audio
 * sample and plays it back
 * 
 * Important Sources:
 * - https://goo.gl/NIerhh
 * - https://goo.gl/nZF0x5
 * - https://goo.gl/bcIYL7
 * - https://goo.gl/VaV8kX
 * - https://goo.gl/86PNFT
 * - https://goo.gl/RVYeG5 - ObjectURL manpage
 * - https://goo.gl/tNB9Bf - setting up localhost
 */


/* Object: GButton
 * -----------------------
 * This is a button object. It represents a button the screen, and houses
 * some important info on that button. Specifically, it contains the HTML
 * id string for the button, the actual HTML element itself (button), the
 * function that is to be called when it is clicked, and a 1-or-0 value that
 * reflects if the button is currently "active" or not. 
 */

function GButton(html_id, click_func, is_active) {
	this.html_id = html_id;
	this.button = document.getElementById(html_id);
	this.click_func = click_func;
	this.is_active = is_active;
}

/* ##### End GButton ##### */

/* ##### Begin Constants/ Globals ##### */
//create context
var context = new (window.AudioContext || window.webkitAudioContext)();
//declare the nodes
var mic_recorder;
//declare the buttons
var rec_button;
var play_button;
var rec_buffer;
//declare other
var rec_chunks = [];
var rec_url;
var full_audio;


const NUM_CHANS = 2;
//const BUFFER_DUR = 3;

/* ##### End Constants/ Globals ##### */

/* Function: init
 * --------------
 * This is the master initialization function for the script. It
 * first initializes the buttons, then initializes the rest of the
 * audio node business. It is called when the HTML page loads.
 */
function init(){
	init_buttons();
	init_audio_nodes();
}

/* Function: init_buttons
 * ----------------------
 * This function creates new GButton objects for the record and play
 * buttons in the HTML document, then intializes click event listeners
 * for both of these buttons.
 */
function init_buttons() {
	rec_button = new GButton("rec_stop", handle_rec_press,  0);
	play_button = new GButton("play", handle_play_stop_press,  0);

	init_button_listener(rec_button);
	init_button_listener(play_button);
}

/* Function: init_button_listener
 * ------------------------------
 * This initializes a new Event Listener, listening for clicks on 
 * whichever button is passed into it. When the button is clicked,
 * the button's "click_func" function fires.
 */
function init_button_listener(btn) {
	btn.button.addEventListener('click', function(){btn.click_func(btn); });
}

/* Function: handle_rec_press
 * --------------------
 * This function handles the pressing of the record button.
 * if the recording is currently happening, it is ended. If it
 * is not, then playback of the sound is stopped (if it is going),
 * and the recording is begun.
 */
function handle_rec_press() {
	if (rec_button.is_active) {
		end_record();
	} else {
		//delete last recording
		if(play_button.is_active) {
			stop_full_audio();
			play_button.is_active = 0;
		}
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
	rec_button.is_active = 0;
}

/* Function: begin_record
 * ----------------------
 * This begins the recording process, and changes the activity boolean of
 * the record button to reflect this.
 */
function begin_record() {
	mic_recorder.start();
	rec_button.is_active = 1;
}

/* Function: play_full_audio
 * -------------------------
 * This plays the audio recording from the beginning, and changes the activity
 * boolean of the play button to reflect this.
 */
function play_full_audio() {
	full_audio.currentTime = 0.0;
	full_audio.play();
	play_button.is_active = 1;
}

/* Function: stop_full_audio
 * -------------------------
 * This stops the currently playing audio recording, and resets
 * the activity boolean on the play button.
 */
function stop_full_audio() {
	full_audio.pause();
	play_button.is_active = 0;
}

/* Function: handle_play_stop_press
 * --------------------------------
 * This function handles behavior when the "Play/Pause" button is
 * pressed. If the recording is not currently being played, and
 * the button is pressed, then the recording is played. If the recording
 * is being played at the time the button is pressed, then the recording
 * is stopped. If no audio has been recorded, that is caught
 */
function handle_play_stop_press() {
	if(full_audio) {
		if (play_button.is_active && !full_audio.ended) {
			stop_full_audio();
		} else {
			play_full_audio();	
		}
	} else {
			console.log("No audio recorded!");
	}
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
	var rec_blob = new Blob(rec_chunks, { 'type' : 'audio/ogg; codecs=opus' });
	rec_chunks = [];
	rec_url	= window.URL.createObjectURL(rec_blob);
	if(full_audio) {
		full_audio.src = rec_url;
	} else {
		full_audio = new Audio(rec_url);	
	}
}

/* Function: init_mic_recorder
 * ---------------------------
 * Initializes the MediaRecorder mic_recorder object. Links it to the
 * audio stream, and declares callback functions for when data is
 * available from the MediaRecorder API, and what to do when the 
 * MediaRecorder object is done recording.
 */
function init_mic_recorder(stream) {
	mic_recorder = new MediaRecorder(stream);
  	mic_recorder.ondataavailable = function(e) {
  		rec_chunks.push(e.data);
  	};
  	mic_recorder.onstop = function(e) {
  		save_rec_blob();
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
		// this syntax comes from https://goo.gl/etOCTm
		navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
  			init_mic_recorder(stream);
		}).catch(function(err) {
  			console.log("Encountered the getUserMedia error: " + err);
		});
	} else {
	   	console.log('getUserMedia not supported on your browser!');
	}
}

/* Function: init_audio_nodes
 * ---------------------------
 * This function initializes the AudioNodes used in the app. It first
 * initializes all those related to the audio stream (ie: mic_recorder),
 * then those related to the audio buffer.
 */
function init_audio_nodes() {
	init_audio_stream();
	//init_audio_buffer();
}