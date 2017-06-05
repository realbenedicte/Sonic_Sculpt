/* Object: Grain
 * -----------------------
 * This is a grain object. It contains all of the information and functionality
 * of a grain. Some important things it contains: grain length, grain start time,
 * grain playback rate, (some other stuff I don't know I need yet). It also prototypes
 * the functionality of playing the grain. Lemme write it and then back to this...
 * 

 * IMP_NOTE: Check out getChannelData for applying the volume Envelope
 */

function Grain(g_ui) {
	// should have access to controls, so it can
	// go get the values on its own
	this.ui = g_ui

	this.buffer = null;
	this.buffer_src = null;
	this.buffer_set = false;
}

Grain.prototype.refresh_buffer = function (buf) {
		console.log("refreshing grain buffer");
		//new_start in seconds
		new_start = this.ui.get_start() * (buf.duration);
		new_end = new_start + (this.ui.get_length()/ buf.sampleRate);
		// get the new buffer and assign
		AudioBufferSlice(buf, new_start, new_end, this, function(e, new_buffer, grain){
			if (e) {
				console.log(e);
			} else {
				grain.buffer = new_buffer;
			}
		});
		this.buffer_set = true;
	}

Grain.prototype.play = function () {
		console.log("playing grain");
		if(!this.buffer) this.refresh_buffer(full_buffer);
		this.buffer_src = context.createBufferSource();
		
		this.buffer_src.buffer = this.buffer;
		this.buffer_src.loop = true;
		this.buffer_src.detune = this.ui.get_detune();
		this.buffer_src.connect(context.destination);

		this.buffer_src.start();
	}

Grain.prototype.stop = function () {
		console.log("stoping grain");
		this.buffer_src.stop();
	}

Grain.prototype.refresh_play = function () {
		console.log("playing with new vals");
		this.stop();
		this.refresh_buffer(full_buffer);
		this.play();
	}

Grain.prototype.strike = function () {
		console.log("striking grain");
		//write this?
	}

/* ##### End GButton ##### */