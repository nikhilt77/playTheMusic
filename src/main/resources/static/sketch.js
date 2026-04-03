let audioContext;
let audioSound;
let fft;
let isPlaying = false;
let bins = 256; // Defines number of frequency bands to analyze
let smoothFactor = 0.8;

const playBtn = document.getElementById('playBtn');
const videoIdInput = document.getElementById('videoIdInput');
const statusMessage = document.getElementById('statusMessage');
const uiContainer = document.getElementById('ui-container');

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    colorMode(HSB, 360, 100, 100, 1);
    
    // Create an explicit Audio context to help browser policy
    userStartAudio();

    // Setup FFT Analyzer
    fft = new p5.FFT(smoothFactor, bins);
}

function draw() {
    background(0, 0, 5, 0.3); // Slight trail effect

    if (!audioSound || !audioSound.isPlaying()) {
        if (!isPlaying && frameCount % 60 === 0) {
            // idle animation
        }
        return;
    }

    let spectrum = fft.analyze();
    let bass = fft.getEnergy("bass");
    let mid = fft.getEnergy("mid");
    let treble = fft.getEnergy("treble");

    translate(width / 2, height / 2);

    // Dynamic rotation based on treble
    rotate(frameCount * map(treble, 0, 255, 0.05, 0.2));

    // Outer radial bars
    noStroke();
    let rTop = map(bass, 0, 255, 100, 250); // Inner hole radius expands with bass

    for (let i = 0; i < spectrum.length; i++) {
        let amp = spectrum[i];
        let angle = map(i, 0, spectrum.length, 0, 360);
        
        // Map height of the bar based on amplitude
        let h = map(amp, 0, 255, 0, 250);
        
        let hue = map(i, 0, spectrum.length, 0, 360) + (frameCount % 360);
        if(hue > 360) hue -= 360;

        fill(hue, 80, 100);

        push();
        rotate(angle);
        // Draw outward
        rect(rTop, -2, h, 4, 2);
        pop();
        
        // Mirror the shape
        push();
        rotate(-angle);
        rect(rTop, -2, h, 4, 2);
        pop();
    }

    // Central pulsing circle for bass
    let pulseRadius = map(bass, 0, 255, 50, 180);
    fill(330, 80, 100, 0.1);
    stroke((frameCount % 360), 80, 100);
    strokeWeight(map(bass, 0, 255, 1, 5));
    circle(0, 0, pulseRadius * 2);

    let innerPulseRadius = map(mid, 0, 255, 30, 120);
    fill((frameCount + 180) % 360, 80, 100, 0.3);
    noStroke();
    circle(0, 0, innerPulseRadius * 2);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}


// Helper to extract YouTube video ID
function extractVideoId(input) {
    // If it's already an 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    
    // Otherwise look for 'v=' or 'youtu.be/' or 'v/' inside the string
    let match = input.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (match && match[1].length === 11) {
        return match[1];
    }
    return null;
}

// UI Event Listeners
playBtn.addEventListener('click', async () => {
    let videoId = videoIdInput.value.trim();
    videoId = extractVideoId(videoId);
    
    if (!videoId) {
        statusMessage.textContent = "Please enter a valid YouTube Video ID or URL.";
        statusMessage.classList.remove('loading');
        return;
    }

    // Ensure audio context is started (browser interaction required)
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }

    setStatus("Fetching stream... (this may take a few seconds)", true);
    playBtn.disabled = true;

    try {
        // We no longer need to fetch the JSON /api/stream first, we can just point loadSound to our proxy
        const streamUrl = `/api/proxy-audio?videoId=${encodeURIComponent(videoId)}`;

        setStatus("Loading audio into player...", true);

        // Load the Audio
        if (audioSound) {
            audioSound.stop();
            audioSound.dispose();
        }

        audioSound = loadSound(streamUrl, 
            () => { // success callback
                setStatus("");
                audioSound.play();
                isPlaying = true;
                
                // Hide UI gracefully
                uiContainer.classList.add('hidden');
                
                // Make canvas clickable to show UI again
                document.querySelector('canvas').addEventListener('click', toggleUI);
            },
            (e) => { // error callback
                playBtn.disabled = false;
                setStatus("Error loading audio. URL might be expired or CORS restricted.");
                console.error(e);
            }
        );

    } catch (error) {
        console.error(error);
        setStatus("Error: " + error.message);
        playBtn.disabled = false;
    }
});

function toggleUI() {
    if (uiContainer.classList.contains('hidden')) {
        uiContainer.classList.remove('hidden');
        playBtn.disabled = false;
        playBtn.textContent = "LOAD & PLAY NEW";
    }
}

function setStatus(msg, isLoading = false) {
    statusMessage.textContent = msg;
    if (isLoading) {
        statusMessage.classList.add('loading');
    } else {
        statusMessage.classList.remove('loading');
    }
}
