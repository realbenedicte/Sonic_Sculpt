//RIGHT NOW:
//

/* File: main.js
 * -----------------------
 * This is going to contain the javascript-working-gubbins for the Grains4u
 * Grainulator, but right now it just contains trivial test stuffs
 * 
 * To implement next: records a sample to a buffer, plays it backs
 * 
 * 
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

//create context
var context = new (window.AudioContext || window.webkitAudioContext)();
//declare the nodes
var gate;
var rec_button;
var play_button;
var mic_source;

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

function handle_rec_press(btn) {
	if (btn.is_active) {
		console.log("end record")
	} else {
		console.log("begin record")
	}
	btn.change_active()
}

function handle_play_stop_press(btn) {
	if (btn.is_active) {
		console.log("end play")
	} else {
		console.log("begin play")
	}
	btn.change_active()

	gate.gain.value = (gate.gain.value + 1) % 2;
}

// Some of this is based on http://tinyurl.com/m7txdkv, mainly the
// mediaDevices stuff
function init_audio_stream() {
	if (navigator.mediaDevices) {
		console.log('getUserMedia supported.');
		// this syntax comes from https://goo.gl/etOCTm
		navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(function(stream) {
  			mic_source = context.createMediaStreamSource(stream);
  			mic_source.connect(gate);
		}).catch(function(err) {
  			console.log("Encountered the getUserMedia error: " + err);
		});
	} else {	
	   	console.log('getUserMedia not supported on your browser!');
	}
}

function init_audio_nodes() {
	//create the audio nodes
	init_audio_stream();
	//then connect to recording buffer? we'll just output it straight for now
	gate = context.createGain();
	gate.gain.value = 0;
	gate.connect(context.destination);

}