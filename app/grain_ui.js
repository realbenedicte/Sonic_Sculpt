
function GrainUI(g_ind, box_x, box_y, box_width, box_height, color) {

  // Store the box dimensions and color passed into the constructor
  this.box_x = box_x;
  this.box_y = box_y;
  this.box_width = box_width;
  this.box_height = box_height;
  this.color = color;
  // Grain should be initialized to a dormant state
  this.dormant = true;

  // Initializes the grain_rect object, a div inside the GrainUI that
  // represents grain position and length. This is the main GrainUI
  // component the user interacts with.
  this.grain_rect = null;
  // Initializes some grain_rect related member variables, which track
  // grain_rect position within the GrainUI
  this.grain_rect_dims_to_def();

  // Initialize booleans that track states of user grain interaction
  this.sliding = false;
  this.left_changing = false;
  this.right_changing = false;

  // This member variable prevents visually bad grain resizing, maintaining
  // the onset distance between the part of the grain being transformed
  this.mouse_offset = 0;

  // Initializes some of the other html components of the of the
  // GrainUI object (see respective "make" functions below for more
  // descriptions)
  this.box = null;
  this.block = null;
  this.spawn_div = null;
  this.remove_div = null;
  this.pause_div = null;
  // record button
  this.record_div = null;
  // Tracks the index of which GrainUI object this one is on the page
  this.g_ind = g_ind;
  // Links this GrainUI object to a noise-generating Grain object.
  this.grain = null;
}
GrainUI.prototype.grain_rect_dims_to_def = function () {
  this.g_left_perc = G_RECT_DEF[0];
  this.g_right_perc = G_RECT_DEF[1];
  this.g_width_perc = G_RECT_DEF[2];
  this.g_left_px = this.g_left_perc * this.box_width;
  this.g_right_px = this.g_right_perc * this.box_width;
  this.g_width_px = this.g_width_perc * this.box_width;
}


/* Function: make_record
 * -------------------
 * Make record button for each box
// MG function
 */
GrainUI.prototype.make_record_div = function () {
  this.record_div = document.createElement('div');
  this.record_div.className = "record_div"

  var inner_msg = document.createElement("h3");
  inner_msg.className = "record_text";
  inner_msg.id = "g_record_" + this.g_ind;
  inner_msg.innerHTML = "record";
  this.record_div.style.background = this.color;
  this.record_div.style.border = "5px solid " + this.color;
  this.record_div.appendChild(inner_msg);
  this.box.appendChild(this.record_div);
}

//new function //MG
GrainUI.prototype.update_playstate = function (playing=false) { //defaults to false
  //playing boolean only exists in this fucntion
  let pause_text = this.pause_div.firstChild;
  if (playing){
    pause_text.innerHTML = "pause"
  }
  else{
      pause_text.innerHTML = "play"
  }
}

/* Function: make_box
 * -------------------
 * This function initializes the div that outlines the GrainUI object,
 * essentially, the visual container for the GrainUI box. Parameters such
 * as box position, dimensions, and border size color are set.
 */
GrainUI.prototype.make_box = function () {
  this.box = document.createElement('div');
  this.box.className = "grain_outer_box";
  app.appendChild(this.box);
}

GrainUI.prototype.make_block = function () {
  this.block = document.createElement('div');
  this.block.className = "grain_block_box";
  this.box.appendChild(this.block);
}

GrainUI.prototype.make_remove_div = function () {
  this.remove_div = document.createElement('div');
  this.remove_div.className = "remove_div";
  var inner_msg = document.createElement("h3");
  inner_msg.className = "remove_text";
  inner_msg.id = "g_reset_" + this.g_ind;
  inner_msg.innerHTML = "delete grain";
  this.remove_div.style.background = this.color;
  this.remove_div.style.border = "5px solid " + this.color;
  this.remove_div.appendChild(inner_msg);
  this.box.appendChild(this.remove_div);
}

//Making Pause
//MG
//
GrainUI.prototype.make_pause_div = function () {
  this.pause_div = document.createElement('div');
  this.pause_div.className = "pause_div";
  var inner_msg = document.createElement("h3");
  inner_msg.className = "pause_text";
  inner_msg.id = "g_pause_" + this.g_ind;
  inner_msg.innerHTML = "pause";
  // inner_msg.style.color = "white";

  this.pause_div.style.background = this.color;
  this.pause_div.style.border = "5px solid " + this.color;

  this.pause_div.appendChild(inner_msg);
  this.box.appendChild(this.pause_div);
}

GrainUI.prototype.make_spawn_div = function () {
  this.spawn_div = document.createElement('div');
  this.spawn_div.className = "spawn_div";
  var inner_msg = document.createElement("h2");
  inner_msg.className = "add_grain_text";
  inner_msg.id = "g_text_" + this.g_ind;
  inner_msg.innerHTML = "no audio";
  inner_msg.style.color = this.color;
  this.spawn_div.appendChild(inner_msg);
  this.box.appendChild(this.spawn_div);
}

GrainUI.prototype.set_grain_rect_width = function (width_px) {
  this.g_width_px = width_px;
  this.grain_rect.style.width = this.g_width_px + "px";
  this.g_width_perc = this.g_width_px / (1.0 * this.box_width);
}

GrainUI.prototype.set_grain_rect_sides = function (left_px, right_px) {
  this.g_left_px = left_px;
  this.g_right_px = right_px;
  this.grain_rect.style.left = this.g_left_px + "px";
  this.g_left_perc = this.g_left_px / (1.0 * this.box_width);
  this.g_right_perc = this.g_right_px / (1.0 * this.box_width);
  this.set_grain_rect_width(right_px - left_px);
}

GrainUI.prototype.make_grain_rect = function () {
  this.grain_rect = document.createElement('div');
  this.grain_rect.className = "g_rect";
  this.grain_rect.id = "g_rect_" + this.g_ind;
  this.set_grain_rect_sides(this.g_left_px, this.g_right_px);
  this.box.appendChild(this.grain_rect);
}


GrainUI.prototype.toggle_live = function (live = true) {
 if(live){
   this.box.classList.add('live');
   this.box.classList.remove('dormant');
 }
  else{
    this.box.classList.add('dormant');
    this.box.classList.remove('live');
  }
}

GrainUI.prototype.draw_init = function () {
  this.make_box();
  this.make_block();
  this.make_spawn_div();
  this.make_grain_rect();
  this.make_record_div();
  this.make_remove_div();
  this.make_pause_div();
  this.toggle_live(false);
}

GrainUI.prototype.handle_grain_rect_click = function (client_x) {

  var bound_dist = G_RECT_SIDE_PERC * this.g_width_px;
  // get left boundary
  var left_bound = bound_dist;
  // get right boundary
  var right_bound = this.g_width_px - bound_dist;
  // if x < left boundary: return "left"
  var g_rect_x = client_x - this.grain_rect.getBoundingClientRect().left;
  if (g_rect_x <= left_bound) {
    this.handle_left_change_start(client_x);
  } else if (g_rect_x >= right_bound) {
    this.handle_right_change_start(client_x);
  } else {
    this.handle_slide_start(client_x);
  }
}

GrainUI.prototype.handle_grain_rect_release = function () {
  if (this.sliding) {
    this.handle_slide_end();
  } else if (this.left_changing) {
    this.handle_left_change_end();
  } else if (this.right_changing) {
    this.handle_right_change_end();
  }
}

GrainUI.prototype.get_grain_rect_center = function () {
  return get_css_val(this.grain_rect.id, "left", true) +
    (get_css_val(this.grain_rect.id, "width", true) / 2.0)
}


GrainUI.prototype.get_x_rel_to_box = function (x) {
  return x - this.box.getBoundingClientRect().left;
}

GrainUI.prototype.store_center_mouse_offset = function (client_x) {
  this.mouse_offset = this.get_grain_rect_center() - this.get_x_rel_to_box(client_x);
}

GrainUI.prototype.store_right_mouse_offset = function (client_x) {
  this.mouse_offset = this.g_right_px - this.get_x_rel_to_box(client_x);
}


GrainUI.prototype.store_left_mouse_offset = function (client_x) {
  this.mouse_offset = this.get_x_rel_to_box(client_x) - this.g_left_px;
}

GrainUI.prototype.handle_new_mouse_coords = function (client_x) {

  if (this.sliding) {
    var next_center = this.get_x_rel_to_box(client_x) + this.mouse_offset;
    this.draw_grain_rect(next_center, this.g_width_px)
    this.grain.refresh_play();
  } else if (this.left_changing) {
    var next_left = this.get_x_rel_to_box(client_x) - this.mouse_offset;
    var next_width = this.g_right_px - next_left;
    var next_center = this.g_right_px - next_width / 2.0;
    if (next_left > 0) {
      this.draw_grain_rect(next_center, next_width);
      this.grain.refresh_play();
    }
  } else if (this.right_changing) {
    var next_right = this.get_x_rel_to_box(client_x) + this.mouse_offset;
    var next_width = next_right - this.g_left_px;
    var next_center = this.g_left_px + next_width / 2.0;
    if (next_right < this.box_width) {
      this.draw_grain_rect(next_center, next_width);
      this.grain.refresh_play();
    }
  }
}

GrainUI.prototype.draw_grain_rect = function (center, width_px) {
  //set width val
  this.set_grain_rect_width(width_px);
  //center grain_rect_on_x
  this.center_grain_rect_on_x(center);
}

GrainUI.prototype.center_grain_rect_on_x = function (center_x) {
  var curr_width_px = get_css_val(this.grain_rect.id, "width", true);
  var new_left = center_x - curr_width_px / 2.0;
  if (new_left < 0) {
    this.set_grain_rect_sides(0, curr_width_px);
  } else if (new_left + curr_width_px > this.box_width) {
    this.set_grain_rect_sides(this.box_width - curr_width_px, this.box_width);
  } else {
    this.set_grain_rect_sides(new_left, new_left + curr_width_px);
  }
}

GrainUI.prototype.handle_slide_start = function (client_x) {
  this.sliding = true;
  this.store_center_mouse_offset(client_x);
}

GrainUI.prototype.handle_right_change_start = function (client_x) {
  this.right_changing = true;
  this.store_right_mouse_offset(client_x);
}

GrainUI.prototype.handle_left_change_start = function (client_x) {
  this.left_changing = true;
  this.store_left_mouse_offset(client_x);
}
GrainUI.prototype.handle_slide_end = function () {
  this.sliding = false;
  this.mouse_offset = 0;
}

GrainUI.prototype.handle_right_change_end = function () {
  this.right_changing = false;
  this.mouse_offset = 0;
}

GrainUI.prototype.handle_left_change_end = function () {
  this.left_changing = false;
  this.mouse_offset = 0;
}

GrainUI.prototype.handle_remove_grain = function () {
  this.toggle_live(false);
  this.grain_rect_dims_to_def();
  this.set_grain_rect_sides(this.g_left_px, this.g_right_px);
  this.grain.buffer = null;
}

GrainUI.prototype.handle_spawn_grain = function () {
  this.toggle_live(true);
}

GrainUI.prototype.unblock_me = function () {
  this.block.style.display = "none";
}

GrainUI.prototype.block_me = function () {
  this.block.style.display = "block";
}
