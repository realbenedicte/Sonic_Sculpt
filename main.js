/* File: main.js
 * -----------------------
 * This is going to contain the javascript-working-gubbins for the Grains4u
 * Grainulator, but right now it just contains trivial test stuffs 
 */

//create context
var context = new (window.AudioContext || window.webkitAudioContext)();
//declare the nodes
var osc;
var gate;
var gate_button;

function init(){
	init_button();
	init_audio_nodes();
}

function init_button() {
	gate_button = document.getElementById("gate");
	gate_button.onclick = mute_unmute;
}

function init_audio_nodes() {
	//create the audio nodes
	osc = context.createOscillator();
	gate = context.createGain();

	//specs for the oscillator
	osc.type = "sine";
	osc.start();

	//specs for the gain gate node
	gate.gain.value = 0;

	//connect nodes to dest;
	osc.connect(gate);
	gate.connect(context.destination);

}

function mute_unmute() {
	console.log("gain changed from " + gate.gain.value);
	gate.gain.value = (gate.gain.value + 1) % 2;
	console.log("to " + gate.gain.value);
}