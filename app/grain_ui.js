
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

/* Function: grain_rect_dims_to_def
 * --------------------------------
 * This functions initializes the member variables within the GrainUI object
 * pertaining to the dimensions and positioning of the inner grain
 * rectangle (grain_rect). It does this by grabbing the default values for
 * the grain_rect's left side position, right side position, and width from
 * the G_RECT_DEF array. The values in this array are stored as percentages,
 * relative to the overall GrainUI box width (ie: g_left_perc is the percent)
 * distance from the left side of the overall box to the left side of the
 * grain_rect box). These values as then used to calculate the corresponding
 * member variables that store grain_rect position values in pixels.
 *
 * NOTE: Eventually, this should be implemented using either percentages OR
 * 		 pixel information, since it's confusing to use them both.
 */
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

/* Function: make_block
 * --------------------
 * This function initializes the div that blocks the GrainUI object from
 * user interaction while the grain is dormant. Parameters such as box position,
 * dimensions, and fill color are set.
 */
GrainUI.prototype.make_block = function () {
  this.block = document.createElement('div');
  this.block.className = "grain_block_box";
  this.box.appendChild(this.block);
}

/* Function: make_remove_div
 * -------------------------
 * This function creates the "clear grain" div that allows you to clear
 * the grain once it has been active. Note: this div only displays when
 * the grain is active, and switches the grain from an active to dormant
 * state. The message is created inside the div, and parameters such as
 * div position, dimensions, and fill color are set.
 */
GrainUI.prototype.make_remove_div = function () {
  this.remove_div = document.createElement('div');
  // this.remove_div.style.position = "absolute";
  // this.remove_div.style.width = this.box_width * 0.1 + "px";
  // this.remove_div.style.height = this.box_height + "px";
  // this.remove_div.style.left = this.box_x + this.box_width + "px";
  // this.remove_div.style.top = "-5px";
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

/* Function: make_spawn_div
 * ------------------------
 * This function creates the "click to add grain" spawn div that allows you
 * initialize the grain, once a sample has been recorded. Note: this div
 * only displays when the div is dormant, and switches the grain from a dormant
 * to an active state. The message is created inside the div, and parameters such as
 * div position, dimensions, and fill color are set.
 */
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

/* Function: set_grain_rect_width
 * ------------------------------
 * This function is called when the width of the inner grain rectangle
 * (grain_rect) must be changed, as a result of the grain length being
 * changed. First, the new width of the grain_rect in pixels is saved in the
 * g_width_px member variable, then the grain_rect div is set with its
 * new width, then the g_width_perc member variable is set.
 */
GrainUI.prototype.set_grain_rect_width = function (width_px) {
  this.g_width_px = width_px;
  this.grain_rect.style.width = this.g_width_px + "px";
  this.g_width_perc = this.g_width_px / (1.0 * this.box_width);
}

/* Function: set_grain_rect_sides
 * ------------------------------
 * This function is called when there are new position values that the
 * left and right sides of the grain_rect box should have, and sets the
 * GrainUI member variables (g_left, g_right, g_width) and grain_rect div
 * properties to reflect these new values.
 */
GrainUI.prototype.set_grain_rect_sides = function (left_px, right_px) {
  this.g_left_px = left_px;
  this.g_right_px = right_px;

  this.grain_rect.style.left = this.g_left_px + "px";

  this.g_left_perc = this.g_left_px / (1.0 * this.box_width);
  this.g_right_perc = this.g_right_px / (1.0 * this.box_width);

  this.set_grain_rect_width(right_px - left_px);
}

/* Function: make_grain_rect
 * -------------------------
 * This function initializes the grain_rect div in the GrainUI object, and
 * adds it to the html document. This grain_rect object is responsible for
 * reflecting and controlling the grain position and size within the
 * overall sample. By resizing and moving the grain_rect object, the user
 * resizes and moves the grain being played.
 */
GrainUI.prototype.make_grain_rect = function () {
  this.grain_rect = document.createElement('div');
  this.grain_rect.style.position = "absolute";
  this.grain_rect.style.height = "inherit";
  this.grain_rect.style.borderRadius = "20px";

  this.grain_rect.style.background = this.color;

  this.grain_rect.className = "g_rect";
  this.grain_rect.id = "g_rect_" + this.g_ind;

  this.set_grain_rect_sides(this.g_left_px, this.g_right_px);

  this.box.appendChild(this.grain_rect);
}

/* Function: togg
 * ----------------------
 * This function draws the GrainUI object to the screen in a
 * dormant state. In its dormant state, the grain is inactive,
 * and the "click to add grain" prompt is displayed.
 */
/* Function: draw_live
 * -------------------
 * This function draws the GrainUI object to the screen in a
 * live state. In its live state, the grain is active,
 * and the user is able to drag and resize the grain_rect.
 */

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

/* Function: draw_init
 * -------------------
 * This function creats all the components of the GrainUI object, then
 * draws the UI in its initial, dormant state. It creates the outer box,
 * the blocking box, the spawn div, the grain rect, and them the "clear grain"
 * div (remove_div). Finally, it draws all these objects to the screen.
 */
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

/* Function: handle_grain_rect_click
 * ---------------------------------
 * This function handles the event of a user clicking/ beginning to
 * manipulate the grain_rect object. First, it calculates the left and
 * right stretch boundaries. These boundaries define x-value ranges on the right
 * and left sides of the grain_rect. If the click is within either of these
 * ranges, a grain stretch interaction is initiated (either the right side or
 * left side of the grain moves, the other is still) rather than a grain slide
 * interaction (the whole grain moves). Using these boundaries, the function
 * determines if the user's location of click should initiate a slide, left stretch
 * or right stretch, and begins that interaction.
 */
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

/* Function: handle_grain_rect_release
 * -----------------------------------
 * This function should be called when a user's interaction
 * with the grain_rect object ends (mouse up event). It determines
 * whether a right stretch, left stretch, or slide event was occuring
 * and does event clean-up for the appropriate one.
 */
GrainUI.prototype.handle_grain_rect_release = function () {
  if (this.sliding) {
    this.handle_slide_end();
  } else if (this.left_changing) {
    this.handle_left_change_end();
  } else if (this.right_changing) {
    this.handle_right_change_end();
  }
}

/* Function: get_grain_rect_center
 * -------------------------------
 * This function returns the x-value (in pixels) of the grain_rect's
 * center, relative to the GrainUI outer box (distance from left side).
 * The value is returned as a number, not a css property string.
 */
GrainUI.prototype.get_grain_rect_center = function () {
  return get_css_val(this.grain_rect.id, "left", true) +
    (get_css_val(this.grain_rect.id, "width", true) / 2.0)
}

/* Function: get_x_rel_to_box
 * --------------------------
 * This function returns the distance between the x-value (pixels) passed
 * into the function and the x-value of the left side of the GrainUI object,
 * relative to the viewport. If the x value is on the left of the GrainUI
 * box, then the returned number is negative. If it is on the right, the returned
 * number is positive.
 */
GrainUI.prototype.get_x_rel_to_box = function (x) {
  return x - this.box.getBoundingClientRect().left;
}

/* Function: store_center_mouse_offset
 * -----------------------------------
 * This function stores the distance between the current user's mouse position
 * and the center of the grain_rect. This is stored in the mouse_offset member
 * variable, which is used during a grain_rect slide interaction, so that
 * the grain_rect moves relative to where the mouse was clicked.
 */
GrainUI.prototype.store_center_mouse_offset = function (client_x) {
  this.mouse_offset = this.get_grain_rect_center() - this.get_x_rel_to_box(client_x);
}

/* Function: store_right_mouse_offset
 * ----------------------------------
 * This function stores the distance between the current user's mouse position
 * and the right side of the grain_rect. This is stored in the mouse_offset member
 * variable, which is used during a grain_rect stretch interaction, so that
 * the right side of the grain_rect moves relative to where the mouse was clicked.
 */
GrainUI.prototype.store_right_mouse_offset = function (client_x) {
  this.mouse_offset = this.g_right_px - this.get_x_rel_to_box(client_x);
}

/* Function: store_left_mouse_offset
 * ---------------------------------
 * This function stores the distance between the current user's mouse position
 * and the left side of the grain_rect. This is stored in the mouse_offset member
 * variable, which is used during a grain_rect stretch interaction, so that
 * the left side of the grain_rect moves relative to where the mouse was clicked.
 */
GrainUI.prototype.store_left_mouse_offset = function (client_x) {
  this.mouse_offset = this.get_x_rel_to_box(client_x) - this.g_left_px;
}

/* Function: handle_new_mouse_coords
 * ---------------------------------
 * This function handles changes in mouse position, and changes the
 * state of the GrainUI object (grain_rect size/position) if need be.
 * If the object is in a state of grain_rect interaction, the type of
 * interaction is recognized, the necessary grain_rect changes are made,
 * and the grain is refreshed to play the new grain's sounds.
 *
 * NOTE: this should be decomposed, maybe writing a get_new_position_values function
 * that calculates next_left, next_right, next_center, ect.?
 */
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

/* Function: draw_grain_rect
 * ------------------------------
 * This function handles drawing the grain_rect object to its appropriate place
 * on the screen, based on the center and width_px values passed into the function.
 * It does this by first setting the width of the grain_rect to width_px, and then
 * centering the grain_rect on that x value.
 */
GrainUI.prototype.draw_grain_rect = function (center, width_px) {
  //set width val
  this.set_grain_rect_width(width_px);
  //center grain_rect_on_x
  this.center_grain_rect_on_x(center);
}

/* Function: center_grain_rect_on_x
 * ------------------------------
 * This function centers the grain_rect div object on the x value that has been
 * passed in. First, it finds the current width of the grain_rect, as well as the
 * potential new left x value of the grain_rect, if we go ahead and center it on
 * that x value. If the user wants to center the grain_rect somewhere that puts
 * the left side at or over the GrainUI box's edge, then grain_rect is drawn at
 * the extreme of the GrainUI box, and no further. The same goes for a right-side
 * stretch. Otherwise, the box is drawn to the screen with the correct new
 * slide-resultant resistant.
 */
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

/* Function: handle_slide_start
 * ----------------------------
 * handles the event where the entire grain slides left or right
 * (grain start shift only).
 */
GrainUI.prototype.handle_slide_start = function (client_x) {
  this.sliding = true;
  this.store_center_mouse_offset(client_x);
}

/* Function: handle_right_change_start
 * -----------------------------------
 * handles the event where the right side of grain is stretched
 * or compressed.
 */
GrainUI.prototype.handle_right_change_start = function (client_x) {
  this.right_changing = true;
  this.store_right_mouse_offset(client_x);
}

/* Function: handle_left_change_start
 * ----------------------------------
 * handles the event where the left side of grain is stretched
 * or compressed.
 */
GrainUI.prototype.handle_left_change_start = function (client_x) {
  this.left_changing = true;
  this.store_left_mouse_offset(client_x);
}

/* Function: handle_slide_end
 * --------------------------
 * handles the event where the entire grain slides left
 * or right (grain start shift only).
 */
GrainUI.prototype.handle_slide_end = function () {
  this.sliding = false;
  this.mouse_offset = 0;
}

/* Function: handle_right_change_end
 * ------------------------------
 * handles the event where the right side of grain is stretched
 * or compressed.
 */
GrainUI.prototype.handle_right_change_end = function () {
  this.right_changing = false;
  this.mouse_offset = 0;
}

/* Function: handle_left_change_end
 * --------------------------------
 * handles the event where the left side of grain is stretched
 * or compressed.
 */
GrainUI.prototype.handle_left_change_end = function () {
  this.left_changing = false;
  this.mouse_offset = 0;
}

/* Function: handle_remove_grain
 * -----------------------------
 * handles the event where the grain is removed, and should be
 * reset.
 */
GrainUI.prototype.handle_remove_grain = function () {
  this.toggle_live(false);
  this.grain_rect_dims_to_def();
  this.set_grain_rect_sides(this.g_left_px, this.g_right_px);
  this.grain.buffer = null;
}

/* Function: handle_spawn_grain
 * ----------------------------
 * handles the event where the grain is spawned, and should
 * jump into action!
 */
GrainUI.prototype.handle_spawn_grain = function () {
  this.toggle_live(true);
}

/* Function: unblock_me
 * --------------------
 * This function deactivates the GrainUI object's block div, allowing the
 * user to interact with the grain. This should be called when the app is
 * active and users can play with the grains.
 */
GrainUI.prototype.unblock_me = function () {
  this.block.style.display = "none";
}

/* Function: block_me
 * --------------------
 * This function activates the GrainUI object's block div, which sits above
 * the UI and prevents them from using the grain. Should be called when the
 * grain is inactive, such as while the user is recording a sound sample, or
 * before they have done so (on app load).
 */
GrainUI.prototype.block_me = function () {
  this.block.style.display = "block";
}
