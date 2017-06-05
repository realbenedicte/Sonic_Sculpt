/* Object: Grain
 * -----------------------
 * This is a grain object. It contains all of the information and functionality
 * of a grain. Some important things it contains: grain length, grain start time,
 * grain playback rate, (some other stuff I don't know I need yet). It also prototypes
 * the functionality of playing the grain. Lemme write it and then back to this...
 * 

 * IMP_NOTE: Check out getChannelData for applying the volume Envelope
 */

function Grain(g_ind, g_ui) {
	// should have access to controls, so it can
	// go get the values on its own
	this.g_ind = g_ind;
	this.ui = g_ui
	this.buffer = null;
	this.buffer_src = null;
	this.buffer_set = false;
	this.grain_on = false;

	//NEXT IMP BUFFERS
	//this.start_buffer = just the first half, faded up
	//this.mod_buffer = second half layered on first, first onto second

	this.apply_vol_env = function() {
		if(this.buffer) {
			// get length of buffer
			var half_len = this.buffer.length/2
			// for i less than half buffer length
			for (var i = 0; i < half_len; i++){
				for(var c = 0; c < this.buffer.numberOfChannels; c++){
					chan_buf = this.buffer.getChannelData(c);
					chan_buf[i] *= i / (1.0 * half_len);
					chan_buf[this.buffer.length-(i+1)] *= i / (1.0 * half_len);
				}
			}
		}
	}

	this.create_mod_buffer = function() {
		//write this, merge with apply_vol_env
	}

}

Grain.prototype.refresh_buffer = function (buf) {
		if(verbose) console.log("refreshing grain buffer");
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
		this.apply_vol_env();
		this.buffer_set = true;
	}

Grain.prototype.play = function () {
		if(verbose) console.log("playing grain");
		if(!this.buffer) this.refresh_buffer(full_buffer);
		this.buffer_src = context.createBufferSource();
		
		this.buffer_src.buffer = this.buffer;
		this.buffer_src.loop = true;
		this.buffer_src.detune.value = this.ui.get_detune();
		this.buffer_src.connect(context.destination);

		this.buffer_src.start();
		this.grain_on = true;
	}

Grain.prototype.stop = function () {
		if(verbose) console.log("stoping grain");
		this.buffer_src.stop();
		this.grain_on = false;
	}

Grain.prototype.refresh_play = function () {
		if(verbose) console.log("playing with new vals");
		if(this.grain_on) this.stop();
		this.refresh_buffer(full_buffer);
		this.play();
	}

Grain.prototype.strike = function () {
		if(verbose) console.log("striking grain");
		//write this?
	}

/* ##### End GButton ##### */