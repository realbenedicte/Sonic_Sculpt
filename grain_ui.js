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
	this.g_width = 0.2;

	//for slide/transformations
	this.mouse_offset = 0;
	this.sliding = false;
	this.left_changing = false;
	this.right_changing = false;

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
		this.box.style.border = "5px solid " + this.color;
		
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
		var left = this.box_width * this.g_left;
		var right = this.box_width * this.g_right;
		this.grain_rect.style.left = left + "px";
		this.grain_rect.style.width = (right - left) + "px";
	}

GrainUI.prototype.make_grain_rect = function() {
		this.grain_rect = document.createElement('div');
		this.grain_rect.style.position = "absolute";
		this.grain_rect.style.height = "inherit";

		this.grain_rect.style.background = this.color;
		this.grain_rect.style.opacity = "0.5";

		this.grain_rect.className = "g_rect";
		this.grain_rect.id = "g_rect_" + this.g_ind;

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

//returns which control zone the coordinate lands in
GrainUI.prototype.handle_grain_rect_click = function(client_x) {
		// get left boundary
		var left_x = G_RECT_SIDE_PERC * this.g_width * this.box_width;
		// get right boundary
		var right_x = (this.g_width * this.box_width) - left_x;
		// if x < left boundary: return "left"
		var g_rect_x = client_x - this.grain_rect.getBoundingClientRect().left;
		if (g_rect_x <= left_x){
			this.handle_left_change_start(client_x);
		} else if (g_rect_x >= right_x) {
			this.handle_right_change_start(client_x);
		} else {
			this.handle_slide_start(client_x);	
		}
	}	

GrainUI.prototype.handle_grain_rect_release = function() {
		if(this.sliding){
			this.handle_slide_end();
		} else if(this.left_changing) {
			this.handle_left_change_end();
		} else if(this.right_changing){
			this.handle_right_change_end();
		}
	}

//relative to box
GrainUI.prototype.get_grain_rect_center = function() {
		return get_css_val(this.grain_rect.id, "left", true) + 
					(get_css_val(this.grain_rect.id, "width", true)/2.0)
	}

//relative to box
GrainUI.prototype.get_x_rel_to_box = function(x) {
		return x - this.box.getBoundingClientRect().left;
	}

//relative to box
GrainUI.prototype.store_center_mouse_offset = function(client_x) {
		this.mouse_offset = this.get_grain_rect_center() - this.get_x_rel_to_box(client_x);
	}	

GrainUI.prototype.refresh_grain_rect_vals = function() {
		this.g_left = get_css_val(this.grain_rect.id, "left", true)/(this.box_width*1.0)
		this.g_width = get_css_val(this.grain_rect.id, "width", true)/(this.box_width*1.0)
		this.g_right = this.g_left + this.g_width;
	}

GrainUI.prototype.handle_new_mouse_coords = function(client_x){
		if(this.sliding){
			var next_center = this.get_x_rel_to_box(client_x) + this.mouse_offset;
			this.center_grain_rect_on_x(next_center);
			this.refresh_grain_rect_vals();
		} else if(this.left_changing) {
			//continue left change
		} else if(this.right_changing){
			//continue right change
		}
	}

//centers on an x, relative to box
GrainUI.prototype.center_grain_rect_on_x = function(x){
		var curr_width = this.grain_rect.getBoundingClientRect().width;
		var new_left = x - curr_width/2.0;
		if(new_left < 0) {
			this.grain_rect.style.left = "0px";
		} else if (new_left + curr_width > this.box_width){
			this.grain_rect.style.left = this.box_width - curr_width + "px";
		} else {
			this.grain_rect.style.left = new_left + "px";
		}
	}

//handles the event where the entire grain slides left
//or right (grain start shift only)
GrainUI.prototype.handle_slide_start = function(client_x) {
		this.sliding = true;
		this.store_center_mouse_offset(client_x);
	}

//handles the event where the right side of grain is stretched
//or compressed
GrainUI.prototype.handle_right_change_start = function() {
		this.right_changing = true;
	}

//handles the event where the left side of grain is stretched
//or compressed
GrainUI.prototype.handle_left_change_start = function() {
		this.left_changing = true;
	}

//handles the event where the entire grain slides left
//or right (grain start shift only)
GrainUI.prototype.handle_slide_end = function() {
		this.sliding = false;
		this.mouse_offset = 0;
	}

//handles the event where the right side of grain is stretched
//or compressed
GrainUI.prototype.handle_right_change_end = function() {
		this.right_changing = false;
		this.mouse_offset = 0;
	}

//handles the event where the left side of grain is stretched
//or compressed
GrainUI.prototype.handle_left_change_end = function() {
		this.left_changing = false;
		this.mouse_offset = 0;
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