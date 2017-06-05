/* Object: GrainUI
 * -----------------------
 * This is a grain UI. It connect to a grain, and tells the grain when the user has
 * set new grain parameters, and what it should do to handle those new parameters.
 * Again, lemme write it and get back to you...
 */

function GrainUI(g_ind, start_id, length_id, detune_id) {
	this.g_ind = g_ind;
	this.start_ctl = document.getElementById(start_id);
	this.length_ctl = document.getElementById(length_id);
	this.detune_ctl = document.getElementById(detune_id);
}

GrainUI.prototype.init_sliders = function(){
		this.init_slider(this.start_ctl, START_MIN, START_MAX, START_STEP, G_DEF_DICT["start"]);
		this.init_slider(this.length_ctl, LENGTH_MIN, LENGTH_MAX, LENGTH_STEP, G_DEF_DICT["length"]);
		this.init_slider(this.detune_ctl, DETUNE_MIN, DETUNE_MAX, DETUNE_STEP, G_DEF_DICT["detune"]);
	}

GrainUI.prototype.trigger_grain_refresh = function() {
		grains[this.g_ind].refresh_play();
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

GrainUI.prototype.get_start = function () {
		return parseFloat(this.start_ctl.value)
	}

GrainUI.prototype.get_length = function () {
		return parseFloat(this.length_ctl.value)
	}

GrainUI.prototype.get_detune = function () {
		return parseFloat(this.detune_ctl.value)
	}