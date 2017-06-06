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

//declaring canvas-related vars
var canvas;
var canvas_context;

//for debugging
var verbose = 1;

//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///
//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///
//CONSTANTS////CONSTANTS////CONSTANTS////CONSTANTS///

const NUM_CHANS = 2;
const NUM_GRAINS = 5;
const G_DEF_DICT = { "start":0.5, "length":1000, "detune": 0};

const START_MIN = 0;
const START_MAX = 1;
const START_STEP = 0.005;

const LENGTH_MIN = 0;
const LENGTH_MAX = 10000;
const LENGTH_STEP = 1;

const DETUNE_MIN = -1200;
const DETUNE_MAX = 1200;
const DETUNE_STEP = 1;

const CANV_WIDTH_RATIO = 0.7;
const CANV_HEIGHT_RATIO = 0.7;
const CANV_BORDER_STYLE = "20px solid black";
const CANV_BORDER_RADIUS = "75px";