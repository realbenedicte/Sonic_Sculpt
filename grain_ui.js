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

	this.g_left_perc = 0.4;
	this.g_right_perc = 0.6;
	this.g_width_perc = 0.2;

	this.g_left_px = this.g_left_perc * box_width;
	this.g_right_px = this.g_right_perc * box_width;
	this.g_width_px = this.g_width_perc * box_width;

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

GrainUI.prototype.make_box = function() {
		this.box = document.createElement('div');
		this.box.style.position = "absolute";
		this.box.style.width = this.box_width + "px";
		this.box.style.height = this.box_height + "px";
		this.box.style.left = APP_PAD + "px"
		this.box.style.top = (this.box_height * this.g_ind) + APP_PAD + "px";

		this.box.className = "grain_outer_box";
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

GrainUI.prototype.set_grain_rect_width = function(width_px) {
		this.g_width_px = width_px;
		this.grain_rect.style.width = this.g_width_px + "px";
		this.g_width_perc = this.g_width_px/(1.0*this.box_width);
	}

GrainUI.prototype.set_grain_rect_sides = function(left_px, right_px) {
		this.g_left_px = left_px;
		this.g_right_px = right_px;

		this.grain_rect.style.left = this.g_left_px + "px";

		this.g_left_perc = this.g_left_px/(1.0*this.box_width);
		this.g_right_perc = this.g_right_px/(1.0*this.box_width);

		this.set_grain_rect_width(right_px - left_px);
	}

GrainUI.prototype.make_grain_rect = function() {
		this.grain_rect = document.createElement('div');
		this.grain_rect.style.position = "absolute";
		this.grain_rect.style.height = "inherit";

		this.grain_rect.style.background = this.color;
		this.grain_rect.style.opacity = "0.5";

		this.grain_rect.className = "g_rect";
		this.grain_rect.id = "g_rect_" + this.g_ind;

		this.set_grain_rect_sides(this.g_left_px, this.g_right_px);

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
		
		var bound_dist = G_RECT_SIDE_PERC * this.g_width_px;
		// get left boundary
		var left_bound = bound_dist;
		// get right boundary
		var right_bound = this.g_width_px - bound_dist;
		// if x < left boundary: return "left"
		var g_rect_x = client_x - this.grain_rect.getBoundingClientRect().left;
		if (g_rect_x <= left_bound){
			this.handle_left_change_start(client_x);
		} else if (g_rect_x >= right_bound) {
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

//relative to box
GrainUI.prototype.store_right_mouse_offset = function(client_x) {
		this.mouse_offset = this.g_right_px - this.get_x_rel_to_box(client_x);
	}

//relative to box
GrainUI.prototype.store_left_mouse_offset = function(client_x) {
		this.mouse_offset = this.get_x_rel_to_box(client_x) - this.g_left_px;
	}

GrainUI.prototype.handle_new_mouse_coords = function(client_x){
		function check_change_is_safe(left, right, g) {
			var width = right - left;
			var min = g.get_min_grain_perc();
			var max = g.get_max_grain_perc();
			return (width > min) && (width < max);
		}

		if(this.sliding){
			var next_center = this.get_x_rel_to_box(client_x) + this.mouse_offset;
			this.draw_grain_rect(next_center, this.g_width_px)
			this.grain.refresh_play();
		} else if(this.left_changing) {
			var next_left = this.get_x_rel_to_box(client_x) - this.mouse_offset;
			var next_width = this.g_right_px - next_left;
			var next_center = this.g_right_px - next_width/2.0;
			if(next_left > 0){
				this.draw_grain_rect(next_center, next_width);
				this.grain.refresh_play();
			}
		} else if(this.right_changing){
			var next_right = this.get_x_rel_to_box(client_x) + this.mouse_offset;
			var next_width = next_right - this.g_left_px;
			var next_center = this.g_left_px + next_width/2.0;
			if(next_right < this.box_width){
				this.draw_grain_rect(next_center, next_width);
				this.grain.refresh_play();
			}
		}
	}

GrainUI.prototype.draw_grain_rect = function(center, width_px) {
		//set width val
		this.set_grain_rect_width(width_px);
		//center grain_rect_on_x
		this.center_grain_rect_on_x(center);
	}

GrainUI.prototype.center_grain_rect_perc = function(x_perc) {
		this.center_grain_rect_on_x(x_perc * this.box_width);
	}

//centers on an x, relative to box
GrainUI.prototype.center_grain_rect_on_x = function(center_x){
		var curr_width_px = get_css_val(this.grain_rect.id, "width", true);
		var new_left = center_x - curr_width_px/2.0;
		if(new_left < 0) {
			this.set_grain_rect_sides(0, curr_width_px);
		} else if (new_left + curr_width_px > this.box_width){
			this.set_grain_rect_sides(this.box_width - curr_width_px, this.box_width);
		} else {
			this.set_grain_rect_sides(new_left, new_left + curr_width_px);
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
GrainUI.prototype.handle_right_change_start = function(client_x) {
		this.right_changing = true;
		this.store_right_mouse_offset(client_x);
	}

//handles the event where the left side of grain is stretched
//or compressed
GrainUI.prototype.handle_left_change_start = function(client_x) {
		this.left_changing = true;
		this.store_left_mouse_offset(client_x);
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

GrainUI.prototype.normalize_buf = function(buf) {
	var return_buf = new Array();
	var buf_max = Math.max(... buf);
	for(var i = 0; i < buf.length; i++){
		return_buf.push(buf[i]/buf_max);
	}
	return return_buf;
}

GrainUI.prototype.draw_waveform = function() {
		function check_to_draw(curr_x, last_px){
			if(parseInt(curr_x) > last_px){
				last_px = parseInt(curr_x);
				return true;
			}
			return false;
		}

		// go by percentage through array
		function get_draw_wave_arr(){

		}

		this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		var buf_floats = this.normalize_buf(full_buffer.getChannelData(0));
		var x_step = this.box_width/(1.0 * full_buffer.length);
		var mid_y = this.box_height/2.0;

		var curr_x = 0;
		var last_px = 0;
		var curr_y = mid_y;

		this.canvas_ctx.beginPath();
		this.canvas_ctx.moveTo(0, mid_y);
		for(var i = 0; i < full_buffer.length; i++){
			curr_x += x_step;
			if (check_to_draw(curr_x, last_px)){
				curr_y = (buf_floats[buf_floats.length - (i+1)] * mid_y) + mid_y;
				this.canvas_ctx.lineTo(curr_x, curr_y);
			}
		}

		this.canvas_ctx.stroke();
	}

// handles the event where the grain is spawned, and should
// jump into action!
GrainUI.prototype.handle_spawn_grain = function() {
		//this.draw_waveform();
		this.draw_live();
	}

// REWRITE THESE

GrainUI.prototype.get_detune = function () {
		//return parseFloat(this.detune_ctl.value)
		//temp 
		return 1;
	}

//BONEYARD////BONEYARD////BONEYARD////BONEYARD////BONEYARD//
//BONEYARD////BONEYARD////BONEYARD////BONEYARD////BONEYARD//
//BONEYARD////BONEYARD////BONEYARD////BONEYARD////BONEYARD//

/*GrainUI.prototype.draw_waveform = function() {
		function check_to_draw(curr_x, last_px){
			if(parseInt(curr_x) > last_px){
				last_px = parseInt(curr_x);
				return true;
			}
			return false;
		}

		function get_draw_wave_arr(){

		}

		this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		var buf_floats = this.normalize_buf(full_buffer.getChannelData(0));
		var x_step = this.box_width/(1.0 * full_buffer.length);
		var mid_y = this.box_height/2.0;

		var curr_x = 0;
		var last_px = 0;
		var curr_y = mid_y;

		this.canvas_ctx.beginPath();
		this.canvas_ctx.moveTo(0, mid_y);
		for(var i = 0; i < full_buffer.length; i++){
			curr_x += x_step;
			if (check_to_draw(curr_x, last_px)){
				curr_y = (buf_floats[buf_floats.length - (i+1)] * mid_y) + mid_y;
				this.canvas_ctx.lineTo(curr_x, curr_y);
			}
		}

		this.canvas_ctx.stroke();
	}*/