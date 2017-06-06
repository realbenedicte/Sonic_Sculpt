//GLOBALS////GLOBALS////GLOBALS////GLOBALS////GLOBALS//
//GLOBALS////GLOBALS////GLOBALS////GLOBALS////GLOBALS//
//GLOBALS////GLOBALS////GLOBALS////GLOBALS////GLOBALS//

//create context
var context = new (window.AudioContext || window.webkitAudioContext)();
// Shim the requestAnimationFrame API, with a setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();

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

//for grain rect resizing
var g_changing = false;

//for debugging
var verbose = 1;

//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///
//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///
//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///

const NUM_CHANS = 2;
const NUM_GRAINS = 5;
const COLORS = ["red", "green", "orange", "purple", "blue"];

const START_MIN = 0;
const START_MAX = 1;
const START_STEP = 0.005;

const LENGTH_MIN = 0;
const LENGTH_MAX = 10000;
const LENGTH_STEP = 1;

const DETUNE_MIN = -1200;
const DETUNE_MAX = 1200;
const DETUNE_STEP = 1;

const APP_ID = "app_div";

//calculated pre-padding
const APP_WIDTH_RATIO = 0.7;
const APP_HEIGHT_RATIO = 0.7;

const APP_BORDER_STYLE = "20px solid black";
const APP_BORDER_RADIUS = "75px";
const APP_PAD = 25;