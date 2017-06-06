// RIGHT NOW:
// - Implement front end, 1 grain

/* ON THE LIST:
 * - Implement front end, all grains
 * - Implement good grain sound (volume envelope, overlapping)
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
 * - https://goo.gl/t7ivz4 - working with clock timing
 * - https://goo.gl/iMWzDQ - Music 220b granular lecture
 * 
 * For the Future:
 * - Midi Control?
 * - Save States/ recordings?
 */

/* Function: init
 * --------------
 * This is the master initialization function for the script. It
 * first initializes the buttons, then initializes the rest of the
 * audio node business. It is called when the HTML page loads.
 */
function init(){
	init_buttons();
	init_audio_stream();
	init_grains();
	init_interface();
}

/* Function: init_buttons
 * ----------------------
 * This function creates new GButton objects for the record and play
 * buttons in the HTML document, then intializes click event listeners
 * for both of these buttons.
 */
function init_buttons() {
	rec_button = new GButton("rec_stop", handle_rec_press,  0);

	init_button_listener(rec_button);
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

function get_grains_playing() {
	var playing = [];
	for(var i = 0; i < NUM_GRAINS; i++){
		if(grains[i].grain_on){
			playing.push(i);
		}
	}
	if(playing.length > 0) {
		return playing;
	} else {
		return null;
	}
}

function stop_grains(playing) {
	for(var i = 0; i < playing.length; i++){
		grains[playing[i]].stop();
	}
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
		var playing = get_grains_playing()
		if(playing) {
			stop_grains(playing);
		}
		delete_rec_blob();
		begin_record();
	}
}

/* Function: end_record
 * ----------------------
 * This ends the recording process, and changes the activity boolean of
 * the record button to reflect this.
 */
function end_record() {
	mic_recorder.stop();

	if(verbose) { console.log("recording stopped"); }
	rec_button.is_active = 0;
	g_fields_set_read_only(false);
}

/* Function: begin_record
 * ----------------------
 * This begins the recording process, and changes the activity boolean of
 * the record button to reflect this.
 */
function begin_record() {
	mic_recorder.start();
	if(verbose) { console.log("recording started"); }
	rec_button.is_active = 1;
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

/* Function: handle_store_full_buffer
 * -----------------------------------
 * This function stores the AudioBuffer object containing the data for 
 * the current audio recording. It it passed an ArrayBuffer object, and
 * processes it with the decodeAudioData function of the AudioContext.
 * 
 * This function uses a FileReader instance to feed the raw data from
 * the full recording blob into an ArrayBuffer object, which we can
 * use later to create playable AudioBuffer objects.

 * ALSO, it inits the grain buffers
 */
function handle_store_full_buffer() {
	var reader = new FileReader();
	reader.onloadstart = function() {if(verbose) { console.log("beginning buffer load"); }}
	reader.onloadend = function() {	
		arr_buf = reader.result;
		context.decodeAudioData(arr_buf).then(function(data) {
			full_buffer = data;
		}).catch(function(err) {
			console.log("Encountered the decodeAudioData error: " + err);
		});
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
  		handle_store_full_buffer();
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

// Construction Zone //// Construction Zone //// Construction Zone //
// Construction Zone //// Construction Zone //// Construction Zone //
// Construction Zone //// Construction Zone //// Construction Zone //

function link_grains_to_uis() {
	for(var i = 0; i < grains.length; i++){
		grains[i].ui = grain_uis[i];
		grain_uis[i].grain = grains[i];
	}
}

/* Function: init_grains
 * ---------------------
 * This function initializes the Grain objects in the grain array, as well
 * as the corresponding GrainUI objects for each grain.
 */
function init_grains() {
	grain_uis = new Array();
	grains = new Array();
	for (var i = 0; i < NUM_GRAINS; i++){
		// init grains
		grains.push(new Grain(i));
	}
}

// most of this is a modified version of init function in https://goo.gl/2r1KPl
function init_canvas() {
	var app_container = document.createElement( 'div' );

    app_container.id = "app_container";
    canvas = document.createElement('canvas');
    canvas_context = canvas.getContext('2d');
    //set canvas width, height 
    canvas.style.width = window.innerWidth * CANV_WIDTH_RATIO + "px";
    canvas.style.height = window.innerHeight * CANV_HEIGHT_RATIO + "px";
    //set canvas x, y
    canvas.style.position = "absolute";
    canvas.style.left = (window.innerWidth - (window.innerWidth * CANV_WIDTH_RATIO))/2.0 + "px";
    canvas.style.top = (window.innerHeight - (window.innerHeight * CANV_HEIGHT_RATIO))/2.0 + "px";
    //set border
    canvas.style.border = CANV_BORDER_STYLE;
    canvas.style.borderRadius = CANV_BORDER_RADIUS;
    
    document.body.appendChild(app_container);
    app_container.appendChild(canvas);
}

function init_interface() {
	// init canvas
	init_canvas();
	//init grain_uis
	grain_uis = new Array();
	for (var i = 0; i < NUM_GRAINS; i++){
		//calc GrainUI init values (box_x, box_y, box_width, box_height)
		//grain_uis.push(new GrainUI( calculated values ));
		grain_uis.push(new GrainUI(i))
	}

	// link grains to ui's
	link_grains_to_uis();
	window.requestAnimFrame(draw_interface);
}

function draw_interface() {
	for(var i = 0; i < NUM_GRAINS; i++){
		grain_uis[i].draw();
	}
}


// BONEYARD //// BONEYARD //// BONEYARD //// BONEYARD //
// BONEYARD //// BONEYARD //// BONEYARD //// BONEYARD //
// BONEYARD //// BONEYARD //// BONEYARD //// BONEYARD //