// --- GLOBAL STATE & CONFIG ---
let midiOutput = null;
let currentChannel = 0; // Default to Channel 1 (Hex 0x90)
const logDisplay = document.getElementById('midi-log');
const channelButtons = document.querySelectorAll('.ch-btn');
const activeNotes = new Set();

// MIDI Map: Computer Key -> MIDI Note Number
const keyToNote = {
    'a': 60, 
    's': 62, 
    'd': 64, 
    'f': 65, 
    'g': 67, 
    'h': 69, 
    'j': 71, 'k': 72
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
        addToLog(`NOTE_ON:${note} | RAW: ${rawHex}`);
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