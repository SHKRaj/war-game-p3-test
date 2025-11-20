// BASIC STRUCTURE DEVELOPED WITH CHATGPT ASSISTANCE
// ACTUAL CONSTRUCTION BY ME

document.addEventListener("DOMContentLoaded", function () {
const counter = document.getElementById("loading-counter");
const tip = document.getElementById("loading-tip");
const main = document.getElementById("main-content");
const loader = document.getElementById("loading-screen");
const bg = document.getElementById("loading-bg");

const tips = [
    "Allocating industrial contracts...",
    "Decrypting transmissions...",
    "Rearming expeditionary forces...",
    "Updating global intelligence feed...",
    "Syncing orbital telemetry...",
    "Verifying diplomatic credentials...",
    "Establishing secure uplink..."
];

let progress = 0;

function randomIncrement() {
    if (progress < 60) return Math.random() * 7 + 5;
    if (progress < 90) return Math.random() * 3 + 1;
    return Math.random() * 2 + 0.5;
}

function randomDelay() {
    return Math.random() * 400 + 100;
}

// change hint every few seconds
setInterval(() => {
    tip.innerText = tips[Math.floor(Math.random() * tips.length)];
}, 3000);

// background rotation
const backgrounds = window.backgrounds || [];
let bgIndex = 0;

function changeBackground() {
    console.log("Changing to index:", bgIndex, "→", backgrounds[bgIndex]);
  // advance index first so each new cycle uses a different image
    bgIndex = (bgIndex + 1) % backgrounds.length;

    bg.classList.add("fade");

    const next = new Image();
    next.src = backgrounds[bgIndex];
    next.onload = () => {
        setTimeout(() => {
        bg.style.backgroundImage = `url(${next.src})`;
        bg.classList.remove("fade");
        }, 1000);
    };
}

// start with the first image, then rotate every few seconds randomly
bg.style.backgroundImage = `url(${backgrounds[0]})`;
setInterval(changeBackground, 3000 + Math.random() * 2000);


// progress illusion
function updateProgress() {
    progress += randomIncrement();
    if (progress > 100) progress = 100;
    counter.textContent = progress.toFixed(0) + "%";

    if (progress >= 100) {
    setTimeout(() => {

        const completeSound = document.getElementById("load-complete");
            if (completeSound) {
            completeSound.volume = volumeLevel || 0.5;
            completeSound.play();
            }

        loader.style.transition = "opacity 1s ease";
        loader.style.opacity = 0;
        setTimeout(() => {
        loader.style.display = "none";
        main.style.display = "block";
        document.body.style.overflow = "auto";
        }, 1000);
    }, 1000);
    } else {
    setTimeout(updateProgress, randomDelay());
    }
}

// Background music toggle
const bgMusic = document.getElementById("bg-music");
const muteBtn = document.getElementById("mute-toggle");
let isMuted = true;

const settingsIcon = document.getElementById("settings-icon");
const settingsSound = document.getElementById("settings-sound");

if (settingsIcon) {
  settingsIcon.addEventListener("click", () => {
    const controls = document.getElementById("volume-controls");
    const selector = document.getElementById("music-selector");

    if (settingsSound) {
      settingsSound.currentTime = 0;
      settingsSound.volume = (volumeLevel || 0.5) * 0.1;
      settingsSound.play();
    }

    const show = controls.style.display === "none";
    controls.style.display = show ? "flex" : "none";
    selector.style.display = show ? "block" : "none";
  });
}

const selector = document.getElementById("music-selector");
if (selector) {
  selector.addEventListener("change", (e) => {
    bgMusic.pause();
    bgMusic.src = e.target.value;
    bgMusic.currentTime = 0;
    if (!isMuted) bgMusic.play();
  });
}



function updateIcon() {
  muteBtn.src = isMuted ? window.iconMute : window.iconUnmute;
}

const volumeIndicator = document.getElementById("volume-indicator");
const volumeUp = document.getElementById("volume-up");
const volumeDown = document.getElementById("volume-down");

let volumeLevel = 0.5; // 0 to 1
const volumeImages = [
  window.volume0,
  window.volume25,
  window.volume50,
  window.volume75,
  window.volume100
];

// Select sound elements
const sounds = document.querySelectorAll("audio");

// When updating volume:
function setGlobalVolume(level) {
  sounds.forEach(audio => {
    audio.volume = level;
  });
}

function updateVolumeImage() {
  const index = Math.round(volumeLevel * 4);
  volumeIndicator.src = volumeImages[index];
  bgMusic.volume = volumeLevel;

  if (volumeLevel === 0) {
    isMuted = true;
  } else {
    isMuted = false;
  }
  updateIcon();
}



volumeUp.addEventListener("click", () => {
  volumeLevel = Math.min(1, volumeLevel + 0.25);
  updateVolumeImage();
});

volumeDown.addEventListener("click", () => {
  volumeLevel = Math.max(0, volumeLevel - 0.25);
  updateVolumeImage();
});


muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  updateIcon();
  if (isMuted) {
    bgMusic.pause();
  } else {
    bgMusic.play();
  }
});

// Start muted, fade in music after loading
window.addEventListener("load", () => {
  setTimeout(() => {
    bgMusic.volume = 0.4; // nice ambient level
    if (!isMuted) bgMusic.play();
  }, 1000);
});


setTimeout(updateProgress, 1000);
});
