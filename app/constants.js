/* File: constants.js
 * -------------------
 * This file contains all of the constants and global variables used in the
 * Grains4U app. A short description of each can be found above the variable's
 * declaration.
 */

//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///
//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///
//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///

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
const NUM_GRAINS = 5;

// The different GrainUI colors
const COLORS = ["red", "green", "orange", "purple", "blue"];

// the HTML id label of the app div
const APP_ID = "app_div";

// the HTML id label of the div containing the Rec/Stop button
const REC_STOP_ID = "rec_stop_wrapper";

// The percentage of the browser window which the app takes up
const APP_WIDTH_RATIO = 0.6;
const APP_HEIGHT_RATIO = 0.8;

// The spacing margin (in pixels) above and below each GrainUI box.
const GRAIN_BOX_MARGIN = 10;

/* G_RECT_SIDE_PERC: Defines the grain_rect's section boundaries
 * as a percentage of the grain_rect's current length. The grain_rect,
 * a component of the GrainUI object that controls grain position and
 * length, has three sections of interaction, one on each side, and one 
 * large one in the middle. Different grain manipulations occur depending
 * on which of these sections is clicked. This percentage of the grain_rect's
 * length is reserved on either side of the grain_rect for right or left
 * grain stretching.
 */
const G_RECT_SIDE_PERC = 0.1;

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

/* G_RECT_DEF: defines the initial state of the inner grain box, including
 * the starting point (index 0 val), ending point (index 0 val), and
 * total width of the inner grain box (index 0 val).
 */
const G_RECT_DEF = [0.6, 0.8, 0.2];