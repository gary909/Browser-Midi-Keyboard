let midiOutput = null;

// 1. Request MIDI Access
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    alert("No MIDI support in your browser.");
}

function onMIDISuccess(midiAccess) {
    const outputs = Array.from(midiAccess.outputs.values());
    if (outputs.length > 0) {
        midiOutput = outputs[0]; // Select the first available MIDI device
        document.getElementById('status').innerText = `Connected to: ${midiOutput.name}`;
    } else {
        document.getElementById('status').innerText = "No MIDI output devices found.";
    }
}

function onMIDIFailure() {
    document.getElementById('status').innerText = "Could not access MIDI devices.";
}

// 2. Listen for Keyboard Events
window.addEventListener('keydown', (event) => {
    if (event.key === 'a' && !event.repeat) {
        playNote(60); // 60 is Middle C
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'a') {
        stopNote(60);
    }
});

// 3. Send MIDI Messages
function playNote(note) {
    if (midiOutput) {
        const noteOn = [0x90, note, 0x7f]; // 0x90 = Note On, 0x7f = Full Velocity
        midiOutput.send(noteOn);
        console.log(`Sent: Note On ${note}`, noteOn);
    }
}

function stopNote(note) {
    if (midiOutput) {
        const noteOff = [0x80, note, 0x00]; // 0x80 = Note Off
        midiOutput.send(noteOff);
        console.log(`Sent: Note Off ${note}`, noteOff);
    }
}