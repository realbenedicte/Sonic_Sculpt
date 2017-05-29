//RIGHT NOW:
//Implement fill_rec_buffer, test that it works

/* File: main.js
 * -----------------------
 * This is going to contain the javascript-working-gubbins for the Grains4u
 * Grainulator, but right now it just contains trivial test stuffs
 * 
 * To implement next: records a sample to a buffer, plays it backs
 * 
 * 
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
var mic_analyzer;
var mic_source;
//declare the buttons
var rec_button;
var play_button;
var rec_buffer;

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

/* I eventually want to implement recording to behave like this stub,
 * where you can record for an arbitrary amount of time, but for now
 * buffer lendth is set at BUFFER_DUR seconds
function handle_rec_press(btn) {
	if (btn.is_active) {
		console.log("end record")
	} else {
		console.log("begin record")
	}
	btn.change_active()
} */

function fill_rec_buffer(buffer) {
	// create buffer inSamp tracker variable
	// while not at end of buffer
		// create intermediate array (min(fft.Size, number of samples left to fill, buffer.length - inSamp))
		// fill the intermediate arr
		// for each channel
			// put intermediate arr into channel buffer at inSamp index
}

function handle_rec_press(btn) {
	if (!btn.is_active) {
		//switch on
		btn.change_active();

		// record over the buffer
		fill_rec_buffer(rec_buffer);

		//Old code
		/*var dataArray = new Float32Array(rec_buffer.length);
		mic_analyzer.getFloatTimeDomainData(dataArray)
		for(var c = 0; c < NUM_CHANS; c++){
			rec_buffer.copyToChannel(dataArray, c)
		}*/

		//switch off
		btn.change_active();
	}
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

// Some of this is based on http://tinyurl.com/m7txdkv, mainly the
// mediaDevices stuff
function init_audio_stream() {
	if (navigator.mediaDevices) {
		console.log('getUserMedia supported.');
		// this syntax comes from https://goo.gl/etOCTm
		navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
  			mic_source = context.createMediaStreamSource(stream);
  			mic_source.connect(mic_analyzer);
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
	mic_analyzer = context.createAnalyser();
	init_audio_stream();
	//then connect to recording buffer? we'll just output it straight for now
	init_audio_buffer();
}