var audioStream = function(fillBuffer) {
    var BUFFER_SIZE = 1024;
    var SAMPLE_RATE = 44100;
    var frame = 0;
    var samples = new Float32Array(BUFFER_SIZE);

    if (typeof AudioContext != "undefined") {
        var context = new AudioContext();
        var node = context.createScriptProcessor(BUFFER_SIZE, 2);
        node.onaudioprocess = function(e) {
            var left = e.outputBuffer.getChannelData(0),
                right = e.outputBuffer.getChannelData(1);

            fillBuffer(frame, samples, BUFFER_SIZE, SAMPLE_RATE);
            frame += BUFFER_SIZE;

            for(var i = 0; i < BUFFER_SIZE; i++)
                left[i] = right[i] = samples[i];
        }

        node.connect(context.destination);
        return node;
    }
    else {
        var audio = new Audio();
        audio.mozSetup(1, SAMPLE_RATE);
        
        setInterval(function() {
            var ahead = frame - audio.mozCurrentSampleOffset();

            //125ms latency is lowest while still stable
            if(ahead < SAMPLE_RATE / 8) {
                fillBuffer(frame, samples, BUFFER_SIZE, SAMPLE_RATE);
                frame += BUFFER_SIZE;

                audio.mozWriteAudio(samples); 
            }
        }, 10);
        return node;
    }
}