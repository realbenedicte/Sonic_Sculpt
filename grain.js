/* File: grain.js
 * -----------------------
 * This is a Grain object. It handles the back-end operations of the grain, including
 * storing the correct slice of the recorded sample as the grain's audio data
 * (grain.buffer), applying a volume envelope to the grain (apply_vol_env), and
 * scheduling the grain to play at precisely the correct times (fire, fire_schedule,
 * and init_fire_schedule). It also contains function that refresh the grain buffer
 * based on user interaction, and handles playing and stopping the grain. All function
 * are commented below.
 */

/* Constructor: Grain
 * --------------------
 * This is the constructor for the Grain object. The argument passed into the 
 * constructor is the g_ind (which of the 5 grains of the app this one
 * is). All member variables and functions are described internally.
 */

function Grain(g_ind) {
	// Reflects the index of the Grain object in the app
	this.g_ind = g_ind;

	// Links to the GrainUI object that controls this Grain object
	this.ui = null;

	// Buffer that contains the actual grain audio data. Updated by
	// refresh_grain(), and played by fire() 
	this.buffer = null;

	// Boolean that tracks if the grain is being played or not.
	this.grain_on = false;

	// Tracks the ID number of an interval-repeating fire_schedule
	// function, so that it can be cleared when the grain is stopped
	this.intID = null;

	// Stores the time (Audio Context clock) of most recent call to fire() 
	this.last_fire_time = null;
}

/* Function: apply_vol_env
 * -----------------------
 * This function applies a standard triangle ramp volumen envelope to the
 * current grain in the buffer. It does this by iterating half of the buffer
 * length, and at each iteration i, grabbing the ith sample from the front and
 * end of the buffer, and scaling each by the ratio i / half_len. Once the
 * iteration has reached the sample in the middle of the buffer, the i / half_len
 * value is 1, and the function is finished.
 */
Grain.prototype.apply_vol_env = function() {
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

/* Function: refresh_buffer
 * ------------------------
 * This function refreshes the grain buffer after user interaction with
 * the GrainUI object. Whenever manipulation of the grain_rect in the
 * GrainUI object occurs, this function should be called. It first 
 * determines where within the buffer passed to it (buf) the grain
 * should be sliced from, and passes this into the AudioBufferSlice function,
 * which takes care of slicing the new grain and saving the new grain in the
 * grain.buffer member variable within the Grain object. Then, the volume 
 * envelope is applied to the grain.
 */
Grain.prototype.refresh_buffer = function (buf) {
		if(verbose) console.log("refreshing grain buffer");
		new_start = this.ui.g_left_perc * buf.duration;
		new_end = this.ui.g_right_perc * buf.duration;
		AudioBufferSlice(buf, new_start, new_end, this, function(e, new_buffer, grain){
			if (e) {
				console.log(e);
			} else {
				grain.buffer = new_buffer;
			}
		});
		this.apply_vol_env();
	}

/* Function: fire
 * --------------
 * This function plays the current grain buffer exactly once. It
 * does this by creating a new BufferSource audio source, linking
 * it to the audio context, linking the grain audio buffer to it, 
 * and playing it. The BufferSource object is destroyed after it
 * is finished playing, based on the .start() call syntax.
 */
Grain.prototype.fire = function(g_buf, time) {
		var g_src = context.createBufferSource();
		g_src.buffer = g_buf;
		g_src.connect(context.destination);
		g_src.start(time, 0, g_src.buffer.duration);
	}

/* Function: fire_schedule
 * -----------------------
 * This function schedules calls of the .fire() function such that the grain
 * is played precises at the correct time (currently, this means once every half
 * of a grain.buffer length's duration). When called, this function looks ahead
 * some set amount (FIRE_SCHED_LOOKAHEAD milliseconds), determines how many times 
 * the grain should be played within the lookahead time, and calls fire() function
 * the appropriate number of times, passing each one the exact audio context 
 * clock time when it should play the grain. Once the function has scheduled all of the
 * fire calls it can, it terminates.
 */
Grain.prototype.fire_schedule = function(grain) {
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

/* Function: init_fire_scheduler
 * -----------------------------
 * This function uses setInterval to schedule the fire_schedule function once
 * every set amount of time (FIRE_SCHED_TIMEOUT milliseconds). This way, the 
 * fire_schedule function can time grains precisely with the AudioContext clock,
 * while still providing users the flexibility of live-updating manipulations 
 * allowed for by repeated calls with short look-ahead times of this fire_scheduler
 * function (For more information on this algorithm, check out https://goo.gl/t7ivz4)
 */
Grain.prototype.init_fire_scheduler = function() {
		var _this = this;
		this.intID = setInterval(function(){
			_this.fire_schedule(_this);
		}, FIRE_SCHED_TIMEOUT);
	}

/* Function: play
 * --------------
 * This function begins the playing of the grain. It checks if the grain
 * buffer has been initialized, calling refresh_buffer if not, and begins
 * playing by calling the init_fire_scheduler function.
 */
Grain.prototype.play = function () {
		if(verbose) console.log("playing grain");
		if(!this.buffer) this.refresh_buffer(full_buffer);
		this.init_fire_scheduler();
		this.grain_on = true;
	}

/* Function: stop
 * --------------
 * This function stops the playing of grain. It ends the interval-repeating
 * call of the fire_schedule function, and does some member function clean-up.
 */
Grain.prototype.stop = function () {
		if(verbose) console.log("stoping grain");
		clearInterval(this.intID);
		this.last_fire_time = null;
		this.grain_on = false;
	}

/* Function: refresh_play
 * ----------------------
 * This function refreshes a currently playing grain. It does this by stopping
 * the playing grain, refreshing the buffer, and then begining play of the
 * grain again.
 */
Grain.prototype.refresh_play = function () {
		if(verbose) console.log("playing with new vals");
		if(this.grain_on) this.stop();
		this.refresh_buffer(full_buffer);
		this.play();
	}