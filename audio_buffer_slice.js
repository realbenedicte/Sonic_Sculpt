/* File: audio_buffer_slice.js
 * --------------------------- 
 * This file contains the AudioBufferSlice function. This function recieves
 * a AudioBuffer object, a start and end time (in seconds), a reference to
 * a Grain object, and a callback function. Using the start and end times, 
 * it safely slices a chunk out of the buffer passed into it. It passes this
 * chunk and the Grain that should keep this chunk into the callback function,
 * so that the chunk can be saved.
 * 
 * NOTE: This function was written by Miguel Mota, and comes from his website at
 *       https://miguelmota.com/bytes/slice-audiobuffer/. I made only slight edits
 *       in implementing it for Grains4U, so credits for this function certainly
 *       go to Mota.
 */

function AudioBufferSlice(buffer, begin, end, grain, callback) {
  
  var error = null;

  var duration = buffer.duration;
  var channels = buffer.numberOfChannels;
  var rate = buffer.sampleRate;

  if (typeof end === 'function') {
    callback = end;
    end = duration;
  }

  if (begin < 0) {
    error = new RangeError('begin time must be greater than 0');
  }

  if (end > duration) {
    error = new RangeError('end time must be less than or equal to ' + duration);
  }

  if (typeof callback !== 'function') {
    error = new TypeError('callback must be a function');
  }

  var startOffset = Math.round(rate * begin);
  var endOffset = Math.round(rate * end);
  var frameCount = endOffset - startOffset;
  var newArrayBuffer;

  try {
    newArrayBuffer = context.createBuffer(channels, endOffset - startOffset, rate);
    var anotherArray = new Float32Array(frameCount);
    var offset = 0;

    for (var channel = 0; channel < channels; channel++) {
      buffer.copyFromChannel(anotherArray, channel, startOffset);
      newArrayBuffer.copyToChannel(anotherArray, channel, offset);
    }
  } catch(e) {
    error = e;
  }

  callback(error, newArrayBuffer, grain);
}