//RIGHT NOW:
// - figuring out how to draw box/grain (lines 67 - 100)

/* On the list:
 *  - responsive to window resize (box_x, box_y, etc.)
 */

/* Object: GrainUI
 * -----------------------
 * This is a grain UI. It connect to a grain, and tells the grain when the user has
 * set new grain parameters, and what it should do to handle those new parameters.
 * Again, lemme write it and get back to you...
 */

function GrainUI(g_ind, box_x, box_y, box_width, box_height, color) {

	//what other things need to happen?

	this.box_x = box_x;
	this.box_y = box_y;
	this.box_width = box_width;
	this.box_height = box_height;
	this.color = color;

	//concerning overall grain state
	this.dormant = true;

	//distance ratios, distance from left of container
	this.g_left = 0.4;
	this.g_right = 0.6;

	//concerning grain draw elements, to be filled
	//in draw_init
	this.box = null;
	this.spawn_div = null;
	this.canvas = null;
	this.canvas_ctx = null;
	this.grain_rect = null;

	//other
	this.g_ind = g_ind;
	this.grain = null;
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

GrainUI.prototype.make_box = function() {
		this.box = document.createElement('div');
		this.box.style.position = "absolute";
		this.box.style.width = this.box_width + "px";
		this.box.style.height = this.box_height + "px";
		this.box.style.left = APP_PAD + "px"
		this.box.style.top = (this.box_height * this.g_ind) + APP_PAD + "px";

		//temp
		this.box.style.border = "1px solid " + this.color;
		
		app.appendChild(this.box);
	}

GrainUI.prototype.make_spawn_div = function() {
		this.spawn_div = document.createElement('div');
		this.spawn_div.style.position = "absolute";
		this.spawn_div.style.width = "inherit";
		this.spawn_div.style.height = "inherit";

		var inner_msg = document.createElement("h2");
		inner_msg.className = "add_grain_text";
		inner_msg.id = "g_text_" + this.g_ind;
		inner_msg.innerHTML = "click to add grain";
		inner_msg.style.color = this.color;

		this.spawn_div.appendChild(inner_msg);
		this.box.appendChild(this.spawn_div);
	}

GrainUI.prototype.make_canvas = function() {
		this.canvas = document.createElement('canvas');
		this.canvas_ctx = this.canvas.getContext("2d");
		this.canvas.style.position = "absolute";
		this.canvas.style.width = "inherit";
		this.canvas.style.height = "inherit";

		this.canvas_ctx.font = "30px Arial";
		this.canvas_ctx.fillText("waveform",10,50);

		this.box.appendChild(this.canvas);
	}

GrainUI.prototype.calc_grain_rect_sides = function() {
		var canv_width = get_css_val_by_elem(this.canvas, "width", true);
		var left = canv_width * this.g_left;
		var right = canv_width * this.g_right;
		this.grain_rect.style.left = left + "px";
		this.grain_rect.style.width = (right - left) + "px";
	}

GrainUI.prototype.make_grain_rect = function() {
		this.grain_rect = document.createElement('div');
		this.grain_rect.style.position = "absolute";
		this.grain_rect.style.height = "inherit";

		this.grain_rect.style.background = this.color;
		this.grain_rect.style.opacity = "0.5";

		this.calc_grain_rect_sides();

		this.box.appendChild(this.grain_rect);
	}

GrainUI.prototype.draw_dormant = function() {
		this.spawn_div.style.display = "block";
		this.canvas.style.display = "none";
		this.grain_rect.style.display = "none";
	}

GrainUI.prototype.draw_live = function() {
		this.spawn_div.style.display = "none";
		this.canvas.style.display = "block";
		this.grain_rect.style.display = "block";

		this.canvas.style.zIndex = "0";
		this.grain_rect.style.zIndex = "1";
	}

GrainUI.prototype.draw_init = function() {
		//make outer_box
		this.make_box();
		//make spawn_grain div
		this.make_spawn_div();
		//make canvas
		this.make_canvas();
		//make grain_rect
		this.make_grain_rect();
		this.draw_dormant();
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

//handles the event where the grain is removed, and should be
//reset
GrainUI.prototype.handle_remove_grain = function() {
		this.draw_dormant();
	}

//handles the event where the grain is spawned, and should
// jump into action!
GrainUI.prototype.handle_spawn_grain = function() {
		this.draw_live();
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

/*GrainUI.prototype.init_buttons = function() {
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

*/