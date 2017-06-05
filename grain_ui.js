/* Object: GrainUI
 * -----------------------
 * This is a grain UI. It connect to a grain, and tells the grain when the user has
 * set new grain parameters, and what it should do to handle those new parameters.
 * Again, lemme write it and get back to you...
 */

function GrainUI(start_id, length_id, detune_id) {
	this.start_ctl = document.getElementById(start_id);
	this.start_ctl.value = G_DEF_DICT["start"];
	this.length_ctl = document.getElementById(length_id);
	this.length_ctl.value = G_DEF_DICT["length"];
	this.detune_ctl = document.getElementById(detune_id);
	this.detune_ctl.value = G_DEF_DICT["detune"];
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