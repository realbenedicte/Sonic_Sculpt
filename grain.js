/* Object: Grain
 * -----------------------
 * This is a grain object. It contains all of the information and functionality
 * of a grain. Some important things it contains: grain length, grain start time,
 * grain playback rate, (some other stuff I don't know I need yet). It also prototypes
 * the functionality of playing the grain. Lemme write it and then get back to this...
 * 
 */

function Grain(info_dict) {
	this.g_start = info_dict["g_start"];
	this.g_length = info_dict["g_length"];
	this.g_rate = info_dict["g_rate"];
	this.buffer = null;
	this.buffer_set = false;
	// other stuff?
}

Grain.prototype.play = function () {
		console.log("playing grain");
		//write this?
	}

Grain.prototype.stop = function () {
		console.log("stoping grain");
		//write this?
	}

Grain.prototype.strike = function () {
		console.log("striking grain");
		//write this?
	}

/* ##### End GButton ##### */