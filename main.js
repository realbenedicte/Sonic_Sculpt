//RIGHT NOW:
// Plays one grain (default values)

//ON THE LIST:
/* - continuous grain value change (ie: slider controls)
 * - responsive play/pause button, isn't clickable if no recording yet
 */

/* File: main.js
 * -----------------------
 * This is going to contain the javascript-working-gubbins for the Grains4u
 * Grainulator, but right now it is only a stub page that records an audio
 * sample and plays it back
 * 
 * Important Sources:
 * - https://goo.gl/NIerhh
 * - https://goo.gl/nZF0x5
 * - https://goo.gl/bcIYL7
 * - https://goo.gl/VaV8kX
 * - https://goo.gl/86PNFT
 * - https://goo.gl/RVYeG5 - ObjectURL manpage
 * - https://goo.gl/tNB9Bf - setting up localhost
 */

/* Function: init
 * --------------
 * This is the master initialization function for the script. It
 * first initializes the buttons, then initializes the rest of the
 * audio node business. It is called when the HTML page loads.
 */
function init(){
	init_buttons();
	g_fields_set_read_only(true);
	init_audio_nodes();
	init_grains();
}

/* Function: init_buttons
 * ----------------------
 * This function creates new GButton objects for the record and play
 * buttons in the HTML document, then intializes click event listeners
 * for both of these buttons.
 */
function init_buttons() {
	rec_button = new GButton("rec_stop", handle_rec_press,  0);
	play_button = new GButton("play", handle_play_stop_press,  0);
	submit_button = new GButton("g_submit", init_grains, 0);

	init_button_listener(rec_button);
	init_button_listener(play_button);
	init_button_listener(submit_button);
}

/* Function: init_button_listener
 * ------------------------------
 * This initializes a new Event Listener, listening for clicks on 
 * whichever button is passed into it. When the button is clicked,
 * the button's "click_func" function fires.
 */
function init_button_listener(btn) {
	btn.button.addEventListener('click', function(){btn.click_func(btn); });
}

/* Function: handle_rec_press
 * --------------------
 * This function handles the pressing of the record button.
 * if the recording is currently happening, it is ended. If it
 * is not, then playback of the sound is stopped (if it is going),
 * and the recording is begun.
 */
function handle_rec_press() {
	if (rec_button.is_active) {
		end_record();
	} else {
		if(play_button.is_active) {
			stop_full_audio();
			play_button.is_active = 0;
		}
		delete_rec_blob();
		begin_record();
	}
}

/* Function: g_fields_set_read_only
 * ----------------------------
 * 
 */
function g_fields_set_read_only(new_val) {
	for(var i = 0; i < NUM_GRAINS; i++){
		for(key in G_DEF_DICT){
			id = key + "_" + i;
			document.getElementById(id).readOnly = new_val;
		}
	}
}

/* Function: end_record
 * ----------------------
 * This ends the recording process, and changes the activity boolean of
 * the record button to reflect this.
 */
function end_record() {
	mic_recorder.stop();
	g_fields_set_read_only(false);
	if(verbose) { console.log("recording stopped"); }
	rec_button.is_active = 0;
}

/* Function: begin_record
 * ----------------------
 * This begins the recording process, and changes the activity boolean of
 * the record button to reflect this.
 */
function begin_record() {
	mic_recorder.start();
	g_fields_set_read_only(true);
	if(verbose) { console.log("recording started"); }
	rec_button.is_active = 1;
}

/* Function: play_full_audio
 * -------------------------
 * This plays the audio recording from the beginning, and changes the activity
 * boolean of the play button to reflect this.
 */
function play_full_audio() {
	full_buffer_src = get_audio_buffer_source(context.destination);
	full_buffer_src.start(0);
	if(verbose) { console.log("file playing"); }
	play_button.is_active = 1;
}

/* Function: stop_full_audio
 * -------------------------
 * This stops the currently playing audio recording, and resets
 * the activity boolean on the play button.
 */
function stop_full_audio() {
	full_buffer_src.stop(0);
	if(verbose) { console.log("file stopped"); }
	play_button.is_active = 0;
}

/* Function: handle_play_stop_press
 * --------------------------------
 * This function handles behavior when the "Play/Pause" button is
 * pressed. If the recording is not currently being played, and
 * the button is pressed, then the recording is played. If the recording
 * is being played at the time the button is pressed, then the recording
 * is stopped. If no audio has been recorded, that is caught
 */
function handle_play_stop_press() {
	if(full_audio) {
		if (play_button.is_active && !full_audio.ended) {
			stop_full_audio();
		} else {
			play_full_audio();	
		}
	} else {
			console.log("No audio recorded!");
	}
}

/* Function: delete_rec_blob
 * -----------------------
 * This revokes the url of the previously-used audio recording, in
 * preparation of a new one about to be created.
 */
function delete_rec_blob(){
	window.URL.revokeObjectURL(rec_url);
}

/* Function: save_rec_blob
 * -----------------------
 * This function fires every time the mic_recorder object finishes
 * recording. It first creates a new audio blob, then gets an object
 * url for this blob. It then passes this object url to the Audio 
 * contructor to make a new HTMLAudioElement object. If this object
 * has already been initialized, then the source value of the Audio
 * element is replaced.
 */
function save_rec_blob() {
	rec_blob = new Blob(rec_chunks, { 'type' : 'audio/ogg; codecs=opus' });
	rec_chunks = [];
	rec_url	= window.URL.createObjectURL(rec_blob);
	if(full_audio) {
		full_audio.src = rec_url;
	} else {
		full_audio = new Audio(rec_url);	
	}
}


/* Function: get_audio_buffer_source
 * -----------------------------------
 * This function creates and returns an AudioBufferSource object that 
 * can play the current full buffer.
 */
function get_audio_buffer_source(out_node){
	var buf_src = context.createBufferSource();
	buf_src.buffer = full_buffer;
    buf_src.connect(out_node);
	return buf_src;
}

/* Function: store_full_buffer
 * -----------------------------------
 * This function stores the AudioBuffer object containing the data for 
 * the current audio recording. It it passed an ArrayBuffer object, and
 * processes it with the decodeAudioData function of the AudioContext.
 */
function store_full_buffer(buf_arr){
	context.decodeAudioData(buf_arr).then(function(data) {
		full_buffer = data;
	}).catch(function(err) {
		console.log("Encountered the decodeAudioData error: " + err);
	});
}

/* Function: create_audio_array_buffer
 * -----------------------------------
 * This function uses a FileReader instance to feed the raw data from
 * the full recording blob into an ArrayBuffer object, which we can
 * use later to create playable AudioBuffer objects.
 */
function create_audio_array_buffer() {
	var reader = new FileReader();
	reader.onloadstart = function() {if(verbose) { console.log("beginning buffer load"); }}
	reader.onloadend = function() {
		full_buffer = store_full_buffer(reader.result);
		if(verbose) { console.log("finished buffer load"); } 
	} 
	reader.readAsArrayBuffer(rec_blob)
}

/* Function: init_mic_recorder
 * ---------------------------
 * Initializes the MediaRecorder mic_recorder object. Links it to the
 * audio stream, and declares callback functions for when data is
 * available from the MediaRecorder API, and what to do when the 
 * MediaRecorder object is done recording.
 */
function init_mic_recorder(stream) {
	mic_recorder = new MediaRecorder(stream, {audioBitsPerSecond : 64000});
  	mic_recorder.ondataavailable = function(e) {
  		rec_chunks.push(e.data);
  	};
  	mic_recorder.onstop = function(e) {
  		save_rec_blob();
  		create_audio_array_buffer();
  	};
}


/* Function: init_audio_stream
 * ---------------------------
 * This initializes all variables and AudioNodes related to capturing
 * the audio stream. It first checks to see if grabbing the audio stream
 * is possible. If so, it passes the stream to init_mic_recorder, so that
 * it can be linked to the MediaRecorder. It catches any errors/ MediaStream
 * incompatibilities with the browser.
 * 
 * Code Sources: https://goo.gl/etOCTm, https://goo.gl/5X2Fzt
 */
function init_audio_stream() {
	if (navigator.mediaDevices) {
		console.log('getUserMedia supported.');
		navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
  			init_mic_recorder(stream);
		}).catch(function(err) {
  			console.log("Encountered the getUserMedia error: " + err);
		});
	} else {
	   	console.log('getUserMedia not supported on your browser!');
	}
}

/* Function: init_audio_nodes
 * ---------------------------
 * This function initializes the AudioNodes used in the app. It first
 * initializes all those related to the audio stream (ie: mic_recorder),
 * then those related to the audio buffer.
 */
function init_audio_nodes() {
	init_audio_stream();
}

function get_grain_val(g_ind, val_id){
	var val_field = document.getElementById(val_id + "_" + g_ind);
	if(val_field.value == "") {
		return G_DEF_DICT[val_id];
	} else {
		return parseFloat(val_field.value);
	}
}

function refresh_grain_buffer(g_ind){ 
	grains[g_ind];
	g.buffer = 
	g.buffer_set = true;

}

function get_grain_info(g_ind){
	//init info array
	info = {} 
	for (key in G_DEF_DICT) {
		info[key] = get_grain_val(g_ind, key);
	}
	return info;
}

function init_grains() {
	grains = new Array();
	for (var i = 0; i < NUM_GRAINS; i++){
		var grain_info = get_grain_info(i);
		grains.push(new Grain(grain_info));
	}
}
