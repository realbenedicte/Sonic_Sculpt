//RIGHT NOW:

// Going to implement without a play buffer, get it saving the file for playback w/out it 
// going into the buffer (just a raw file), and then figure out the playBuffer sitch in a 
// sec #### CHECK OUT reader.readAsArrayBuffer(blob) ####

// httpd.conf permission = 644

/* File: main.js
 * -----------------------
 * This is going to contain the javascript-working-gubbins for the Grains4u
 * Grainulator, but right now it just contains trivial test stuffs
 * 
 * To implement next: records a sample to a buffer, plays it backs
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
 * some important info on that button. I'll write it, and then I'll know
 * more about what that info is
 */

function GButton(html_label, click_func, is_active) {
	this.html_label = html_label;
	this.button = document.getElementById(html_label);
	this.click_func = click_func;
	this.is_active = is_active;
}

GButton.prototype.change_active = function() {
						this.is_active = (this.is_active + 1) % 2;
					};

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


const NUM_CHANS = 2;
const BUFFER_DUR = 3;

/* ##### End Constants/ Globals ##### */

function init(){
	init_buttons();
	init_audio_nodes();
}

/* grabs the record and play/stop buttons from html, assigns them
 * things to do when pressed
 */
function init_buttons() {
	rec_button = new GButton("rec_stop", handle_rec_press,  0);
	play_button = new GButton("play", handle_play_stop_press,  0);

	init_button_listener(rec_button);
	init_button_listener(play_button);
}

function init_button_listener(btn) {
	btn.button.addEventListener('click', function(){btn.click_func(btn); });
}

function save_rec_blob() {
	var rec_blob = new Blob(rec_chunks, { 'type' : 'audio/ogg; codecs=opus' });
	rec_chunks = [];
	rec_url	= window.URL.createObjectURL(rec_blob);
}

/* I eventually want to implement recording to behave like this stub,
 * where you can record for an arbitrary amount of time, but for now
 * buffer lendth is set at BUFFER_DUR seconds
 */
function handle_rec_press(btn) {
	if (btn.is_active) {
		end_record(btn);
	} else {
		begin_record(btn);
	}
}

function end_record(btn) {
	mic_recorder.stop();
	console.log("ending record");
	btn.change_active();
}

function begin_record(btn) {
	//switch on
	mic_recorder.start();
	console.log(mic_recorder.state);
	btn.change_active();
}

// this helper function comes from https://goo.gl/VaV8kX
function playSound(buffer) {
  	var source = context.createBufferSource();
  	source.buffer = buffer;
  	source.connect(context.destination);
  	source.start(0);
}

/* plays what's in the buffer */
function handle_play_stop_press(btn) {
	if (!btn.is_active) {
		btn.change_active()
		console.log("begin play")
		playSound(rec_buffer);
		btn.change_active()
	}
}


//Initializes the MediaRecorder mic_recorder object
function init_mic_recorder(stream) {
	mic_recorder = new MediaRecorder(stream);
  	mic_recorder.ondataavailable = function(e) {
  		rec_chunks.push(e.data);
  	};
  	mic_recorder.onstop = function(e) {
  		save_rec_blob();
  	};
}

// Some of this is based on http://tinyurl.com/m7txdkv, mainly the
// mediaDevices stuff
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

function init_audio_buffer() {
	rate = context.sampleRate;
	rec_buffer = context.createBuffer(NUM_CHANS, BUFFER_DUR * rate, rate);
}

function init_audio_nodes() {
	//create the audio nodes
	init_audio_stream();
	//then connect to recording buffer? we'll just output it straight for now
	//init_audio_buffer();
}