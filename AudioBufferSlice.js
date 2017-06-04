/* This comes straight off of this https://miguelmota.com/bytes/slice-audiobuffer/
 * with pretty much no edits, so def not my property. Usage is something like:

 AudioBufferSlice(buffer, begin, end, function(error, slicedAudioBuffer) {
     if (error) {
       console.error(error);
     } else {
       source.buffer = slicedAudioBuffer;

       var gainNode = audioContext.createGain();
       gainNode.gain.value = 1;
       source.connect(gainNode);
       gainNode.connect(audioContext.destination);
     }
 */

function AudioBufferSlice(buffer, begin, end, callback) {
  if (!(this instanceof AudioBufferSlice)) {
    return new AudioBufferSlice(buffer, begin, end, callback);
  }

  var error = null;

  var duration = buffer.duration;
  var channels = buffer.numberOfChannels;
  var rate = buffer.sampleRate;

  if (typeof end === 'function') {
    callback = end;
    end = duration;
  }

  // milliseconds to seconds
  begin = begin/1000;
  end = end/1000;

  if (begin < 0) {
    error = new RangeError('begin time must be greater than 0');
  }

  if (end > duration) {
    error = new RangeError('end time must be less than or equal to ' + duration);
  }

  if (typeof callback !== 'function') {
    error = new TypeError('callback must be a function');
  }

  var startOffset = rate * begin;
  var endOffset = rate * end;
  var frameCount = endOffset - startOffset;
  var newArrayBuffer;

  try {
    newArrayBuffer = audioContext.createBuffer(channels, endOffset - startOffset, rate);
    var anotherArray = new Float32Array(frameCount);
    var offset = 0;

    for (var channel = 0; channel < channels; channel++) {
      buffer.copyFromChannel(anotherArray, channel, startOffset);
      newArrayBuffer.copyToChannel(anotherArray, channel, offset);
    }
  } catch(e) {
    error = e;
  }

  callback(error, newArrayBuffer);
}