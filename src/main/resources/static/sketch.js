let audioContext;
let audioSound;
let fft;
let isPlaying = false;
let bins = 256; // Defines number of frequency bands to analyze
let smoothFactor = 0.6; // Snappier smoothing for better sync
let zoff = 0; // Perlin noise offset for Aura theme

const playBtn = document.getElementById('playBtn');
const videoIdInput = document.getElementById('videoIdInput');
const statusMessage = document.getElementById('statusMessage');
const uiContainer = document.getElementById('ui-container');

// Player Dialog Elements
const playerDialog = document.getElementById('player-dialog');
const togglePlayBtn = document.getElementById('togglePlayBtn');
const loadNewSongBtn = document.getElementById('loadNewSongBtn');
const songTitle = document.getElementById('songTitle');
const songAuthor = document.getElementById('songAuthor');
let currentTheme = 'radial';
const themeSelector = document.getElementById('themeSelector');

const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const totalTimeDisplay = document.getElementById('totalTimeDisplay');
let isScrubbing = false;

themeSelector.addEventListener('change', (e) => {
    currentTheme = e.target.value;
});

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
}

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

    if (audioSound) {
        if (!isScrubbing && audioSound.duration()) {
            let current = audioSound.currentTime();
            let total = audioSound.duration();
            if (total > 0 && isFinite(total)) {
                progressBar.value = (current / total) * 100;
                currentTimeDisplay.textContent = formatTime(current);
                totalTimeDisplay.textContent = formatTime(total);
            }
        }
    }

    if (!audioSound || !audioSound.isPlaying()) {
        return;
    }

    let spectrum = fft.analyze();
    let bass = fft.getEnergy("bass");
    let mid = fft.getEnergy("mid");
    let treble = fft.getEnergy("treble");

    if (currentTheme === 'radial') {
        drawRadial(spectrum, bass, mid, treble);
    } else if (currentTheme === 'waveform') {
        drawWaveform();
    } else if (currentTheme === 'bars') {
        drawRetroEQ(spectrum);
    } else if (currentTheme === 'aura') {
        drawAura(bass, mid, treble);
    } else if (currentTheme === 'glitch') {
        drawGlitch(spectrum, bass, treble);
    }
}

function drawRadial(spectrum, bass, mid, treble) {
    push();
    translate(width / 2, height / 2);

    // Dynamic rotation based on treble
    rotate(frameCount * map(treble, 0, 255, 0.05, 0.2));

    // Outer radial bars
    noStroke();
    let rTop = map(bass, 0, 255, 100, 250); // Inner hole radius expands with bass

    for (let i = 0; i < spectrum.length; i++) {
        let amp = spectrum[i];
        let angle = map(i, 0, spectrum.length, 0, 360);
        
        let h = map(amp, 0, 255, 0, 250);
        let hue = map(i, 0, spectrum.length, 0, 360) + (frameCount % 360);
        if(hue > 360) hue -= 360;

        fill(hue, 80, 100);

        push();
        rotate(angle);
        rect(rTop, -2, h, 4, 2);
        pop();
        
        push();
        rotate(-angle);
        rect(rTop, -2, h, 4, 2);
        pop();
    }

    // Central pulsing circle for bass - using exponential mapping for punchier beats
    let bassExp = pow(map(bass, 0, 255, 0, 1), 3);
    let pulseRadius = 50 + (180 * bassExp);
    fill(330, 80, 100, 0.1);
    stroke((frameCount % 360), 80, 100);
    strokeWeight(map(bassExp, 0, 1, 1, 5));
    circle(0, 0, pulseRadius * 2);

    let innerPulseRadius = map(mid, 0, 255, 30, 120);
    fill((frameCount + 180) % 360, 80, 100, 0.3);
    noStroke();
    circle(0, 0, innerPulseRadius * 2);
    pop();
}

function drawWaveform() {
    let waveform = fft.waveform();
    noFill();
    stroke((frameCount % 360), 80, 100);
    strokeWeight(4);
    
    beginShape();
    for (let i = 0; i < waveform.length; i++){
        let x = map(i, 0, waveform.length, 0, width);
        let y = map(waveform[i], -1, 1, height/2 - 200, height/2 + 200);
        vertex(x, y);
    }
    endShape();
}

function drawRetroEQ(spectrum) {
    noStroke();
    let barWidth = width / spectrum.length;
    for (let i = 0; i < spectrum.length; i++) {
        let amp = spectrum[i];
        let y = map(amp, 0, 255, height, height / 2);
        let hue = map(i, 0, spectrum.length, 0, 360) + (frameCount % 360);
        if(hue > 360) hue -= 360;
        fill(hue, 80, 100);
        // Draw bars growing from bottom
        rect(i * barWidth, y, barWidth - 2, height - y);
    }
}

function drawAura(bass, mid, treble) {
    push();
    translate(width / 2, height / 2);
    noStroke();

    let bassExp = pow(map(bass, 0, 255, 0, 1), 2);
    let masterRadius = map(bassExp, 0, 1, 150, 450);

    // Speed of morphing modulated by mid frequencies
    zoff += map(mid, 0, 255, 0.01, 0.08);

    // Draw overlapping shapes for an organic liquid feel
    for (let j = 0; j < 3; j++) {
        let hue = ((frameCount * 0.3) + j * 80) % 360; 
        fill(hue, 70, 100, 0.4);

        beginShape();
        for (let a = 0; a < 360; a += 5) {
            let xoff = map(cos(a), -1, 1, 0, 2);
            let yoff = map(sin(a), -1, 1, 0, 2);
            
            // Generate perlin noise radius
            let r = map(noise(xoff + j*100, yoff + j*100, zoff), 0, 1, masterRadius * 0.4, masterRadius * 1.5);
            
            let x = r * cos(a);
            let y = r * sin(a);
            vertex(x, y);
        }
        endShape(CLOSE);
    }
    pop();
}

function drawGlitch(spectrum, bass, treble) {
    push();
    // Screen Shake active on heavy bass
    let shakeAmount = 0;
    if (bass > 220) {
        shakeAmount = map(bass, 220, 255, 0, 30);
        translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    }
    
    // Background flashes for explosive hits
    if (bass > 230 && frameCount % 4 === 0) {
        background(0, 0, 100, 0.2); // White flash
    }

    noStroke();

    // Fast sharp geometric sliced shapes
    for (let i = 0; i < 25; i++) {
        let band = floor(random(spectrum.length));
        let ampExp = pow(map(spectrum[band], 0, 255, 0, 1), 3);
        
        if (ampExp > 0.2) {
            let w = random(20, width * ampExp);
            let h = random(2, 15);
            let x = random(width);
            let y = random(height);

            // Red channel chromatic offset
            fill(0, 100, 100, 0.8);
            rect(x - shakeAmount*2, y, w, h);

            // Blue channel chromatic offset
            fill(240, 100, 100, 0.8);
            rect(x + shakeAmount*2, y, w, h);

            // Bright white core
            fill(0, 0, 100);
            rect(x, y, w, h);
        }
    }
    
    // Horizontal interference scanlines
    fill(0, 0, 100, 0.1);
    for (let i = 0; i < height; i += 12) {
        if (random() > 0.8) {
            rect(0, i, width, random(1, 4));
        }
    }
    pop();
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
            async () => { // success callback
                setStatus("");
                audioSound.play();
                isPlaying = true;
                
                // Hide UI gracefully
                uiContainer.classList.add('hidden');
                
                // Show player dialog
                playerDialog.classList.remove('hidden');
                togglePlayBtn.textContent = "⏸ PAUSE";
                songTitle.textContent = "Loading Song...";
                songAuthor.textContent = "Analyzing metadata";

                // Fetch metadata internally from youtube
                try {
                    const infoRes = await fetch(`/api/info?videoId=${encodeURIComponent(videoId)}`);
                    if (infoRes.ok) {
                        const infoData = await infoRes.json();
                        songTitle.textContent = infoData.title || "Unknown Title";
                        songAuthor.textContent = infoData.author_name || "Unknown Artist";
                    } else {
                        songTitle.textContent = "Unknown Title";
                        songAuthor.textContent = "Unknown Artist";
                    }
                } catch(e) {
                    songTitle.textContent = "Unknown Title";
                    songAuthor.textContent = "Unknown Artist";
                }
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

togglePlayBtn.addEventListener('click', () => {
    if (audioSound && audioSound.isPlaying()) {
        audioSound.pause();
        isPlaying = false;
        togglePlayBtn.textContent = "▶ PLAY";
    } else if (audioSound) {
        audioSound.play();
        isPlaying = true;
        togglePlayBtn.textContent = "⏸ PAUSE";
    }
});

loadNewSongBtn.addEventListener('click', () => {
    uiContainer.classList.remove('hidden');
    playBtn.disabled = false;
    playBtn.textContent = "LOAD & PLAY NEW";
});

progressBar.addEventListener('mousedown', () => {
    isScrubbing = true;
});

progressBar.addEventListener('input', () => {
    if (audioSound && audioSound.duration()) {
        let total = audioSound.duration();
        let seekTime = (progressBar.value / 100) * total;
        currentTimeDisplay.textContent = formatTime(seekTime);
    }
});

progressBar.addEventListener('change', () => {
    if (audioSound && audioSound.duration()) {
        let total = audioSound.duration();
        let seekTime = (progressBar.value / 100) * total;
        audioSound.jump(seekTime);
    }
    isScrubbing = false;
});

function setStatus(msg, isLoading = false) {
    statusMessage.textContent = msg;
    if (isLoading) {
        statusMessage.classList.add('loading');
    } else {
        statusMessage.classList.remove('loading');
    }
}
