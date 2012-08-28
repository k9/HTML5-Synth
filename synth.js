var NO_NOTE = 99;

function mix(start, end, mix) {
    return start * (1 - mix) + end * mix;
}

var A = Math.pow(2, 1/12);
var noteHz = function(note) {
    return 220 * Math.pow(A, note - 24);
};

var sampleTriangle = function(note, time, notePos) {
    var freq = noteHz(note);
    var pos = (time * freq) % 1;
    if(pos > 0.75) return -1;
    if(pos > 0.5) return 0;
    if(pos > 0.25) return 1;
    return 0;
};

var sampleSine = function(note, time, notePos) {
    var freq = noteHz(note);
    return Math.sin(time * freq * Math.PI * 2);
};

var sampleSquare = function(note, time, notePos) {
    var freq = noteHz(note);
    var pos = (time * freq) % 1;
    if(pos > 0.5) return 1;
    return -1;
};

var melodySynth = function(note, time, notePos) {
    if(note == NO_NOTE) return 0;
    var decay = 0.01;
    var sample = sampleTriangle(note, time, notePos) * 0.05;
    sample += sampleSine(note, time, notePos) * 0.95;
    sample *= Math.pow(1 - (notePos * decay), 4);
    return sample;
};

var bassSynth = function(note, time, notePos) {
    if(note == NO_NOTE) return 0;
    var sample = sampleTriangle(note, time, notePos) * 0.005;
    sample += sampleSine(note, time, notePos) * 0.995;
    return sample;
};

var drumSynth = function(note, time, notePos) {
    if(note > 3) return 0;
    
    if(note == 1) {  //snare
        var sample = mix(sampleSine(35, time, notePos), Math.random() * 2 - 1, 0.5);
        sample *= 0.05 * Math.pow(1 - notePos, 8);
        return sample;
    }

    if(note == 2) {  //bass drum
        var sample = mix(sampleSine(10, time, notePos), Math.random() * 2 - 1, 0.002);
        sample *= Math.pow(1 - notePos, 6);
        return sample;
    }

    if(note == 3) {  //hi hat
        var sample = mix(sampleSine(80, time, notePos), Math.random() * 2 - 1, 0.75);
        sample *= 0.1 * Math.pow(1 - notePos, 24);
        return sample;
    }
};

var playNote = function(crossFadeTime, sequence, notePos, time) {
    var sample = 0;
    if(notePos < crossFadeTime) {
        var fade = notePos / crossFadeTime;
        sample += sequence.synth(sequence.prevNote, time, notePos + 1) * (1 - fade) + 
            sequence.synth(sequence.note, time, notePos) * fade;            
    }
    else {
        sample += sequence.synth(sequence.note, time, notePos);
    }

    if(Math.abs(sample) > 1) console.log(sample)
    return sample;
};

var playVoices = function(voices, time, volume, bpm) {
    var sample = 0;
    var barPos = 4 * bpm / 60;
    for(var j = 0; j < voices.length; j++) {
        var songPos = (time % (voices[j].notes.length / barPos)) * barPos;
        var noteNum = Math.floor(songPos);
        var notePos = songPos % 1;

        voices[j].nextNoteNum = noteNum + 1 % voices[j].notes.length;
        voices[j].note = voices[j].notes[noteNum];
        var prevNoteNum = noteNum == 0 ? voices[j].notes.length - 1 : noteNum - 1;
        voices[j].prevNote = voices[j].notes[prevNoteNum];
        sample += playNote(0.1, voices[j], notePos, time) * voices[j].volume;
    }
    return sample;
}