/* Object: Grain
 * -----------------------
 * This is a grain object. It contains all of the information and functionality
 * of a grain. Some important things it contains: grain length, grain start time,
 * grain playback rate, (some other stuff I don't know I need yet). It also prototypes
 * the functionality of playing the grain. Lemme write it and then get back to this...
 * 

 * IMP_NOTE: Check out getChannelData for applying the volume Envelope
 */

function Grain(start_id, length_id, rate_id) {
	// should have access to controls, so it can
	// go get the values on its own
	this.start_ctl = document.getElementById(start_id);
	this.start_ctl.value = G_DEF_DICT["start"];
	this.length_ctl = document.getElementById(length_id);
	this.length_ctl.value = G_DEF_DICT["length"];
	this.rate_ctl = document.getElementById(rate_id);
	this.rate_ctl.value = G_DEF_DICT["rate"];

	this.buffer = null;
	this.buffer_src = null;
	this.buffer_set = false;
}

Grain.prototype.get_start = function () {
		return parseFloat(this.start_ctl.value)
	}

Grain.prototype.get_length = function () {
		return parseFloat(this.length_ctl.value)
	}

Grain.prototype.get_rate = function () {
		return parseFloat(this.rate_ctl.value)
	}

Grain.prototype.refresh_buffer = function (buf) {
		console.log("refreshing grain buffer");
		//new_start in seconds
		new_start = this.get_start() * (buf.duration);
		new_end = new_start + (this.get_length()/ buf.sampleRate);
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
		this.buffer_src = context.createBufferSource();
		
		this.buffer_src.buffer = this.buffer;
		this.buffer_src.loop = true;
		this.buffer_src.playbackRate = this.get_rate();
		this.buffer_src.connect(context.destination);

		this.buffer_src.start();
	}

Grain.prototype.stop = function () {
		console.log("stoping grain");
		this.buffer_src.stop();
	}

Grain.prototype.strike = function () {
		console.log("striking grain");
		//write this?
	}

/* ##### End GButton ##### */