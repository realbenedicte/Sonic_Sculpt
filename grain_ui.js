/* On the list:
 *  - responsive to window resize (box_x, box_y, etc.)
 */

/* Object: GrainUI
 * -----------------------
 * This is a grain UI. It connect to a grain, and tells the grain when the user has
 * set new grain parameters, and what it should do to handle those new parameters.
 * Again, lemme write it and get back to you...
 */

function GrainUI(g_ind, box_x, box_y, box_width, box_height) {

	//what other things need to happen?

	this.box_x = box_x;
	this.box_y = box_y;
	this.box_width = box_width;
	this.box_height = box_height;

	//distance ratios, distance from left of container
	this.g_left = -1;
	this.g_right = -1;
	
	this.g_ind = g_ind;
	this.grain = null;
	this.dormant = true;

}

/* gets how far the left side of the grain is from the left
 * side of the container (distance ratio)
 */
GrainUI.prototype.get_left_dist = function() {

	}

/* gets how far the right side of the grain is from the left
 * side of the container (distance ratio)
 */
GrainUI.prototype.get_right_dist = function() {

	}

/* converts a distance ratio from left side of container to point
 * (0 is all the way to the left, 1 all the way to the right, 0.5 
 * in the middle) and coverts it to the number of samples into the
 * buffer array that is.
 */
GrainUI.prototype.dist_ratio_to_samps = function() {

	}

//inits grain to dormant state
GrainUI.prototype.init = function() {

	}

//handles spawning the grain interface
GrainUI.prototype.spawn = function() {
		if(verbose) console.log("GrainUI: spawing grain ui!")
	}

//draws the current grain state, must have 
GrainUI.prototype.draw = function() {
		if(verbose) console.log("GrainUI: drawing grain ui!")
	}

//handles the event where the entire grain slides left
//or right (grain start shift only)
GrainUI.prototype.handle_slide = function() {

	}

//handles the event where the right side of grain is stretched
//or compressed
GrainUI.prototype.handle_right_change = function() {

	}

//handles the event where the left side of grain is stretched
//or compressed
GrainUI.prototype.handle_left_change = function() {

	}

// REWRITE THESE

//returns the starting position
GrainUI.prototype.get_start = function () {
		return parseFloat(this.start_ctl.value)
	}

GrainUI.prototype.get_length = function () {
		return parseFloat(this.length_ctl.value)
	}

GrainUI.prototype.get_detune = function () {
		return parseFloat(this.detune_ctl.value)
	}

//BONEYARD////BONEYARD////BONEYARD////BONEYARD////BONEYARD//
//BONEYARD////BONEYARD////BONEYARD////BONEYARD////BONEYARD//
//BONEYARD////BONEYARD////BONEYARD////BONEYARD////BONEYARD//

GrainUI.prototype.init_buttons = function() {
		this.init_play_btn();
		this.init_sliders();
	}

GrainUI.prototype.init_play_btn = function() {
		var _this = this;
		this.play_ctl.addEventListener('click', function(){ 
			g = grains[_this.g_ind];
			if(g.grain_on){
				g.stop();
			} else {
				g.refresh_play();
			}
		});
	}

GrainUI.prototype.init_sliders = function(){
		this.init_slider(this.start_ctl, START_MIN, START_MAX, START_STEP, G_DEF_DICT["start"]);
		this.init_slider(this.length_ctl, LENGTH_MIN, LENGTH_MAX, LENGTH_STEP, G_DEF_DICT["length"]);
		this.init_slider(this.detune_ctl, DETUNE_MIN, DETUNE_MAX, DETUNE_STEP, G_DEF_DICT["detune"]);
	}

GrainUI.prototype.init_slider = function(sldr, min, max, step, initial){
		sldr.min = min;
		sldr.max = max;
		sldr.step = step;
		sldr.value = initial;

		var _this = this;
		sldr.addEventListener('change', function(){
			grains[_this.g_ind].refresh_play();
		});
	}