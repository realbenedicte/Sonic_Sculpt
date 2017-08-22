/* File: constants.js
 * -------------------
 * This file contains all of the constants and global variables used in the
 * Grains4U app. A short description of each can be found above the variable's
 * declaration.
 */

//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///
//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///
//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///

//create context
var context = new (window.AudioContext || window.webkitAudioContext)();

//declare the nodes
var mic_recorder;
var full_array_buffer;
//declare the buttons
var rec_button;
var play_button;
var rec_buffer;
//declare other
var rec_chunks = [];
var rec_url;
var rec_blob;
var full_audio;

//declare full-buffer-related vars
var full_buffer;
var full_buffer_src;

//declare grain-related vars
var grains;
var grain_uis;

//declaring app-div-related vars
var app;

//index of grain rect currently changing
var g_changing = -1;

//for debugging
var verbose = 0;

const NUM_CHANS = 2;
const NUM_GRAINS = 5;
const COLORS = ["red", "green", "orange", "purple", "blue"];

const START_MIN = 0;
const START_MAX = 1;
const START_STEP = 0.005;

const LENGTH_MIN = 100;
const LENGTH_MAX = 10000;
const LENGTH_STEP = 1;

const APP_ID = "app_div";

//calculated pre-padding
const APP_WIDTH_RATIO = 0.6;
const APP_HEIGHT_RATIO = 0.8;

const GRAIN_BOX_MARGIN = 10;

const G_RECT_SIDE_PERC = 0.1;

const FIRE_SCHED_TIMEOUT = 25;
const FIRE_SCHED_LOOKAHEAD = 100;

// defines the initial state of the inner grain box, including
// the starting point, ending point, and total width of the inner
// grain box
const G_RECT_DEF = [0.6, 0.8, 0.2];