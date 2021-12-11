//NOTE THESE CONSTANTS ARE MOSTLY UNMODIFIED AND COME FROM:
//https://cm-gitlab.stanford.edu/mherrero/grains4u

// Creates the AudioContext object that the entire app
// will use to operate.
var context = new (window.AudioContext || window.webkitAudioContext)();

// Declare the MediaRecorder object for recording the user's
// microphone input
var mic_recorder;

// Declare the var for the record button object
var rec_button;

// Declare vars used during the process of recording the user's
// microphone input, as well as decoding the audio from the
// sample as a AudioBuffer object
var rec_chunks = [];
var rec_url;
var rec_blob;
var full_audio;

// Declare the buffer that will contain all the audio data of the current
// full, user-recorded sample
var full_buffer;

// Declare var to hold array of Grain objects
var grains;

// Declare var to hold array of GrainUI objects
var grain_uis;

// Declaring the var the refers to the app div of the
// Grains4u application
var app;

// The index of the grain rect currently being manipulated (-1 if
// no current manipulations)
var g_changing = -1;

// For verbose console logging during debugging
var verbose = 0;

// Number of grains in the app
const NUM_GRAINS = 4;

// the HTML id label of the app div
const APP_ID = "app_div";

/* FIRE_SCHED_TIMEOUT: For use in the Grain object's grain
 * scheduling solution. The timeout constant defines how often
 * (in milliseconds) the fire_schedule method should be called
 * to schedule plays of the current grain buffer. Calls to
 * fire_schedule are scheduled on Javascript's clock.
 */
const FIRE_SCHED_TIMEOUT = 25;

/* FIRE_SCHED_LOOKAHEAD: For use in the Grain object's grain
 * scheduling solution. The lookahead constant defines how far into
 * the future (in milliseconds) the fire_schedule method should look
 * to schedule plays of the current grain buffer. Grain buffer plays
 * are scheduled on the Web Audio API's clock.
 */
const FIRE_SCHED_LOOKAHEAD = 100;
