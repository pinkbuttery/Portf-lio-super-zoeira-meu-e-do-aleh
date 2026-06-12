const audio = document.getElementById("audio");
const visualizer = document.querySelector(".visualizer");
const playlist = document.getElementById("playlist");

const progressFill = document.querySelector(".progress-fill");
const timeText = document.querySelector(".time");
const title = document.querySelector(".song-title");

const fileInput = document.getElementById("fileInput");
const btnAbrir = document.getElementById("abrir");

const volume = document.getElementById("volume");
const muteBtn = document.getElementById("mute");
const balance = document.getElementById("balance");

const eqSliders = document.querySelectorAll(".eq-sliders input");

const fsBtn = document.getElementById("fs");
const exitFsBtn = document.getElementById("exitFs");

let tracks = [];

/* =========================
   VISUALIZER BARS
========================= */
for (let i = 0; i < 48; i++) {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    visualizer.appendChild(bar);
}

const bars = document.querySelectorAll(".bar");

/* =========================
   FILE LOAD
========================= */
btnAbrir.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    tracks.push({
        name: file.name,
        url
    });

    renderPlaylist();
    loadTrack(tracks.length - 1);
});

/* =========================
   PLAYLIST
========================= */
function renderPlaylist() {

    playlist.innerHTML = "";

    tracks.forEach((track, index) => {

        const li = document.createElement("li");
        li.textContent = track.name;

        li.onclick = () => loadTrack(index);

        playlist.appendChild(li);
    });
}

/* =========================
   LOAD TRACK
========================= */
function loadTrack(index) {

    if (!tracks[index]) return;

    audio.src = tracks[index].url;
    title.textContent = tracks[index].name;

    audio.play();

    initAudio();
}

/* =========================
   CONTROLS
========================= */
document.getElementById("play").onclick = () => audio.play();
document.getElementById("pause").onclick = () => audio.pause();

/* =========================
   PROGRESS
========================= */
audio.addEventListener("timeupdate", () => {

    if (!audio.duration) return;

    const percent = (audio.currentTime / audio.duration) * 100;

    progressFill.style.width = percent + "%";

    timeText.textContent =
        format(audio.currentTime) + " / " +
        format(audio.duration);
});

function format(sec) {

    if (!sec || isNaN(sec)) return "00:00";

    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);

    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

/* =========================
   AUDIO ENGINE
========================= */
let ctx;
let source;
let analyser;
let gainNode;
let panNode;
let filters = [];
let dataArray;

let initialized = false;
let eqBound = false;
let animRunning = false;

/* ===== EXTRA PRO ===== */
let sensitivity = 0.4;
let smoothing = 0.85;
let smoothBars = new Array(48).fill(0);

/* =========================
   INIT AUDIO
========================= */
function initAudio() {

    if (initialized) return;
    initialized = true;

    ctx = new (window.AudioContext || window.webkitAudioContext)();

    source = ctx.createMediaElementSource(audio);

    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    gainNode = ctx.createGain();
    panNode = ctx.createStereoPanner();

    const freqs = [60,170,350,600,1000,3000,6000,12000,16000,20000];

    freqs.forEach(freq => {

        const filter = ctx.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;

        filters.push(filter);
    });

    source.connect(filters[0]);

    for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
    }

    filters[filters.length - 1].connect(panNode);
    panNode.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(ctx.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    bindEQ();

    if (!animRunning) {
        animRunning = true;
        animate();
        drawMilkdrop();
    }
}

/* =========================
   EQ SLIDERS
========================= */
function bindEQ() {

    if (eqBound) return;
    eqBound = true;

    eqSliders.forEach((slider, i) => {

        slider.addEventListener("input", () => {
            if (filters[i]) {
                filters[i].gain.value = Number(slider.value);
            }
        });

    });
}

/* =========================
   VISUALIZER (PRO VERSION)
========================= */
function animate() {

    requestAnimationFrame(animate);

    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    let bass = dataArray[1] || 0;

    bars.forEach((bar, i) => {

        const raw = dataArray[i] || 0;
        const scaled = raw * sensitivity;

        smoothBars[i] = smoothBars[i] * smoothing + scaled * (1 - smoothing);

        bar.style.height = Math.max(2, smoothBars[i]) + "px";
    });

    /* ===== BASS PUNCH ===== */
    if (bass * sensitivity > 120) {
        document.body.style.filter = "brightness(1.3)";
    } else {
        document.body.style.filter = "brightness(1)";
    }

    /* ===== COLOR REACTIVE ===== */
    const hue = (bass * 2) % 360;

    document.documentElement.style.setProperty(
        "--glow",
        `hsl(${hue}, 100%, 60%)`
    );
}

/* =========================
   MILKDROP
========================= */
const canvas = document.createElement("canvas");
const c = canvas.getContext("2d");

visualizer.appendChild(canvas);

function resizeCanvas() {
    canvas.width = visualizer.clientWidth;
    canvas.height = visualizer.clientHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const particles = [];

for (let i = 0; i < 60; i++) {

    particles.push({
        x: Math.random() * 400,
        y: Math.random() * 200,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        r: Math.random() * 2 + 1
    });
}

function drawMilkdrop() {

    requestAnimationFrame(drawMilkdrop);

    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    c.fillStyle = "rgba(0,0,0,0.2)";
    c.fillRect(0,0,canvas.width,canvas.height);

    for (let i = 0; i < 80; i++) {

        const v = dataArray[i] || 0;

        c.beginPath();
        c.arc(canvas.width/2, canvas.height/2, v, 0, Math.PI*2);
        c.strokeStyle = "rgba(0,255,255,0.1)";
        c.stroke();
    }

    particles.forEach(p => {

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        c.fillStyle = "cyan";
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI*2);
        c.fill();
    });
}

/* =========================
   VOLUME / MUTE
========================= */
audio.volume = 1;

volume.addEventListener("input", () => {
    audio.volume = volume.value / 100;
});

let lastVolume = 1;

muteBtn.addEventListener("click", () => {

    if (audio.volume > 0) {
        lastVolume = audio.volume;
        audio.volume = 0;
        volume.value = 0;
    } else {
        audio.volume = lastVolume;
        volume.value = lastVolume * 100;
    }
});

/* =========================
   BALANCE
========================= */
balance.addEventListener("input", () => {

    if (!panNode) return;

    panNode.pan.value = balance.value / 100;
});

/* =========================
   DRAG & DROP
========================= */
document.addEventListener("dragover", e => e.preventDefault());

document.addEventListener("drop", e => {

    e.preventDefault();

    const files = [...e.dataTransfer.files];

    files.forEach(file => {

        if (!file.type.includes("audio")) return;

        const url = URL.createObjectURL(file);

        tracks.push({
            name: file.name,
            url
        });
    });

    renderPlaylist();

    if (tracks.length === 1) {
        loadTrack(0);
    }
});

/* =========================
   FULLSCREEN
========================= */
fsBtn.addEventListener("click", () => {
    document.body.classList.add("fullscreen");

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    }
});

exitFsBtn.addEventListener("click", () => {
    document.body.classList.remove("fullscreen");

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {
        document.body.classList.remove("fullscreen");

        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
});

/* =========================
   SAFETY AUDIO INIT
========================= */
document.addEventListener("click", () => {

    if (ctx && ctx.state === "suspended") {
        ctx.resume();
    }

}, { once: true });