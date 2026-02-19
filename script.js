// --- GLOBAL STATE & CONFIG ---
let midiOutput = null;
let currentChannel = 0; // Default to Channel 1 (Hex 0x90)
const logDisplay = document.getElementById('midi-log');
const channelButtons = document.querySelectorAll('.ch-btn');
const activeNotes = new Set();

// MIDI Map: Computer Key -> MIDI Note Number
const keyToNote = {
    'a': 60, // C
    'w': 61, // C#
    's': 62, // D
    'e': 63, // D#
    'd': 64, // E
    'f': 65, // F
    't': 66, // F#
    'g': 67, // G
    'y': 68, // G#
    'h': 69, // A
    'u': 70, // A#
    'j': 71, // B
    'k': 72  // C (High)
};

// --- INITIALIZATION ---
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

// --- MIDI LOGIC ---
function playNote(note) {
    if (midiOutput) {
        const statusByte = 0x90 + currentChannel;
        const velocity = 0x7f; // Full volume
        const message = [statusByte, note, velocity];
        
        midiOutput.send(message);
        
        // Log both standard info and Raw Data
        const rawHex = `[0x${statusByte.toString(16)}, ${note}, ${velocity}]`;
        addToLog(`NOTE_ON:  ${note} | RAW: ${rawHex}`);
    }
}

function stopNote(note) {
    if (midiOutput) {
        const statusByte = 0x80 + currentChannel;
        const message = [statusByte, note, 0x00];
        
        midiOutput.send(message);
        
        const rawHex = `[0x${statusByte.toString(16)}, ${note}, 0]`;
        addToLog(`NOTE_OFF: ${note} | RAW: ${rawHex}`);
    }
}

// --- EVENT LISTENERS ---
window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const note = keyToNote[key];
    if (note && !activeNotes.has(note)) {
        activeNotes.add(note);
        playNote(note);
        document.getElementById(`key-${note}`)?.classList.add('pressed');
    }
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    const note = keyToNote[key];
    if (note) {
        activeNotes.delete(note);
        stopNote(note);
        document.getElementById(`key-${note}`)?.classList.remove('pressed');
    }
});

// Channel Switching Logic
channelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        channelButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentChannel = parseInt(btn.dataset.ch);
        addToLog(`SYSTEM: CHANNEL_SWAP -> ${currentChannel + 1}`);
    });
});

// Mouse Click Logic for Keys
document.querySelectorAll('.key').forEach(keyElement => {
    keyElement.addEventListener('mousedown', (event) => {
        const noteStr = keyElement.id.split('-')[1];
        const note = parseInt(noteStr);
        if (note && !activeNotes.has(note)) {
            activeNotes.add(note);
            playNote(note);
            keyElement.classList.add('pressed');
        }
    });

    keyElement.addEventListener('mouseup', (event) => {
        const noteStr = keyElement.id.split('-')[1];
        const note = parseInt(noteStr);
        if (note) {
            activeNotes.delete(note);
            stopNote(note);
            keyElement.classList.remove('pressed');
        }
    });

    keyElement.addEventListener('mouseleave', (event) => {
        const noteStr = keyElement.id.split('-')[1];
        const note = parseInt(noteStr);
        if (note && activeNotes.has(note)) {
            activeNotes.delete(note);
            stopNote(note);
            keyElement.classList.remove('pressed');
        }
    });
});

// --- UI HELPERS ---
function addToLog(message) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `> ${message}`;
    logDisplay.appendChild(entry);
    logDisplay.scrollTop = logDisplay.scrollHeight;

    if (logDisplay.childNodes.length > 50) {
        logDisplay.removeChild(logDisplay.firstChild);
    }
}