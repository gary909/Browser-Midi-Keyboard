let midiOutput = null;

// MIDI Map: Computer Key -> MIDI Note Number
const keyToNote = {
    'a': 60, // C
    's': 62, // D
    'd': 64, // E
    'f': 65, // F
    'g': 67, // G
    'h': 69, // A
    'j': 71, // B
    'k': 72  // C (High)
};

// Keep track of active notes to prevent "stuttering" when holding a key
const activeNotes = new Set();

// Request MIDI Access
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
    const outputs = Array.from(midiAccess.outputs.values());
    if (outputs.length > 0) {
        midiOutput = outputs[0];
        document.getElementById('status').innerText = `READY: ${midiOutput.name}`;
    } else {
        document.getElementById('status').innerText = "NO MIDI OUTPUT DETECTED";
    }
}

function onMIDIFailure() {
    document.getElementById('status').innerText = "MIDI ACCESS DENIED";
}

// Event Listeners
window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const note = keyToNote[key];

    if (note && !activeNotes.has(note)) {
        activeNotes.add(note);
        playNote(note);
    }
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    const note = keyToNote[key];

    if (note) {
        activeNotes.delete(note);
        stopNote(note);
    }
});

function playNote(note) {
    if (midiOutput) {
        midiOutput.send([0x90, note, 0x7f]);
        console.log(`MIDI ON: ${note}`);
    }
}

function stopNote(note) {
    if (midiOutput) {
        midiOutput.send([0x80, note, 0x00]);
        console.log(`MIDI OFF: ${note}`);
    }
}