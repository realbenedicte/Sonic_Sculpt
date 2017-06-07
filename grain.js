/* RIGHT NOW:
 * Implement a new play function that fires at twice the current speed, using
 * the audio clock
 */

/* Object: Grain
 * -----------------------
 * This is a grain object. It contains all of the information and functionality
 * of a grain. Some important things it contains: grain length, grain start time,
 * grain playback rate, (some other stuff I don't know I need yet). It also prototypes
 * the functionality of playing the grain. Lemme write it and then back to this...

 * For the Future:
 * - different sound envelope shapes?
 */

function Grain(g_ind, g_ui) {

	this.apply_vol_env = function() {
		if(this.buffer) {
			var half_len = this.buffer.length/2
			for (var i = 0; i < half_len; i++){
				for(var c = 0; c < this.buffer.numberOfChannels; c++){
					chan_buf = this.buffer.getChannelData(c);
					chan_buf[i] *= i / (1.0 * half_len);
					chan_buf[this.buffer.length-(i+1)] *= i / (1.0 * half_len);
				}
			}
		}
	}

	this.g_ind = g_ind;
	this.ui = null;
	this.buffer = null;
	this.buffer_src = null;
	this.buffer_set = false;
	this.grain_on = false;
	this.intID = null;
	this.last_fire_time = null;
}

Grain.prototype.refresh_buffer = function (buf) {
		if(verbose) console.log("refreshing grain buffer");
		//new_start in seconds
		new_start = this.ui.g_left_perc * buf.duration;
		new_end = this.ui.g_right_perc * buf.duration;

		if(new_end == 1) console.log("at end");
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

Grain.prototype.fire = function(g_buf, time) {
		var g_src = context.createBufferSource();
		g_src.buffer = g_buf;
		g_src.detune.value = this.ui.get_detune();
		g_src.connect(context.destination);
		g_src.start(time, 0, g_src.buffer.duration);
	}

/*Grain.prototype.fire_schedule = function(grain) {
		//get number of grain_fires to schedule
		var sched_call = context.currentTime;
		var samps_in_lookahead = FIRE_SCHED_LOOKAHEAD * (context.sampleRate/1000.0);
		var samps_btw_fires = grain.buffer.length/2.0;
		var samps_til_next_fire = ((grain.last_fire_time * context.sampleRate) + samps_btw_fires) - 
										((sched_call) * context.sampleRate);
		if(samps_in_lookahead >= samps_til_next_fire){
			while(samps_til_next_fire < samps_in_lookahead){
				var fire_time = samps_til_next_fire / (context.sampleRate * 1.0);
				grain.fire(grain.buffer, fire_time);
				this.last_fire_time = fire_time;
				samps_til_next_fire += samps_btw_fires;
			}
		}
	}*/

Grain.prototype.fire_schedule = function(grain) {
		//get number of grain_fires to schedule
		var sec_in_lookahead = FIRE_SCHED_LOOKAHEAD/1000.0;
		var sec_btw_fires = grain.buffer.duration/2.0;
		if(grain.last_fire_time){
			var next_fire_time = grain.last_fire_time + sec_btw_fires;
		} else {
			var next_fire_time = context.currentTime + (context.currentTime%sec_btw_fires);
		}
		while(next_fire_time < context.currentTime + sec_in_lookahead){
			grain.fire(grain.buffer, next_fire_time);
			this.last_fire_time = next_fire_time;
			next_fire_time += sec_btw_fires;
		}
	}	

Grain.prototype.init_fire_scheduler = function() {
	var _this = this;
	this.intID = setInterval(function(){
		_this.fire_schedule(_this);
	}, FIRE_SCHED_TIMEOUT);
};

Grain.prototype.play = function () {
		if(verbose) console.log("playing grain");
		if(!this.buffer) this.refresh_buffer(full_buffer);
		this.init_fire_scheduler();
		this.fire_schedule(this);
		this.grain_on = true;
	}

Grain.prototype.stop = function () {
		if(verbose) console.log("stoping grain");
		clearInterval(this.intID);
		this.grain_on = false;
	}

Grain.prototype.refresh_play = function () {
		if(verbose) console.log("playing with new vals");
		if(this.grain_on) this.stop();
		this.refresh_buffer(full_buffer);
		this.play();
	}

Grain.prototype.get_min_grain_perc = function() {
		return LENGTH_MIN / (full_buffer.length * 1.0);
	}

Grain.prototype.get_max_grain_perc = function() {
		return LENGTH_MAX / (full_buffer.length * 1.0);
	}

Grain.prototype.strike = function () {
		if(verbose) console.log("striking grain");
		//write this?
	}


/* ##### End GButton ##### */