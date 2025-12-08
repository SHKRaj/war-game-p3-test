// BASIC STRUCTURE DEVELOPED WITH CHATGPT ASSISTANCE
// ACTUAL CONSTRUCTION BY ME

document.addEventListener("DOMContentLoaded", function () {
  const counter = document.getElementById("loading-counter");
  const tip = document.getElementById("loading-tip");
  const main = document.getElementById("main-content");
  const loader = document.getElementById("loading-screen");
  const bg = document.getElementById("loading-bg");
  const loadingLogo = document.querySelector(".loading-logo");

  const bgMusic = document.getElementById("bg-music");
  const muteBtn = document.getElementById("mute-toggle");
  const settingsIcon = document.getElementById("settings-icon");
  const settingsSound = document.getElementById("settings-sound");
  const selector = document.getElementById("music-selector");
  const completeSound = document.getElementById("load-complete");

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
  let isMuted = false;
  let audioUnlocked = false;

  // --- AUDIO UNLOCKER ---
  document.body.addEventListener("click", () => {
    if (!audioUnlocked) {
      bgMusic.volume = 0.4;
      bgMusic.play().catch(() => {});
      audioUnlocked = true;
    }
  });

  // --- BACKGROUND ROTATION ---
  const backgrounds = window.backgrounds || [];
  let bgIndex = 0;

  function changeBackground() {
    if (backgrounds.length === 0) return;
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

  if (backgrounds.length > 0) {
    bg.style.backgroundImage = `url(${backgrounds[0]})`;
    setInterval(changeBackground, 2000 + Math.random() * 1000);
  }

  // --- PROGRESS LOGIC ---
  function randomIncrement() {
    if (progress < 60) return Math.random() * 5 + 2;
    if (progress < 90) return Math.random() * 3 + 1;
    return Math.random() * 2 + 0.5;
  }

  function randomDelay() {
    return Math.random() * 600 + 100;
  }

  function updateProgress() {
    progress += randomIncrement();
    if (progress > 100) progress = 100;
    counter.textContent = progress.toFixed(0) + "%";

    if (progress >= 100) {
      setTimeout(() => {
        // move logo up-left
        if (loadingLogo) loadingLogo.classList.add("move-top-left");

        // play completion sound
        if (completeSound) {
          completeSound.volume = 0.25;
          completeSound.play().catch(() => {});
        }

        // fade loader out
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

  // --- TIP ROTATION ---
  setInterval(() => {
    tip.innerText = tips[Math.floor(Math.random() * tips.length)];
  }, 3000);

  // --- ICON CONTROLS ---
  function updateIcon() {
    muteBtn.src = isMuted ? window.iconMute : window.iconUnmute;
  }

  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    updateIcon();
    if (isMuted) bgMusic.pause();
    else bgMusic.play().catch(() => {});
  });

  updateIcon();

  if (settingsIcon) {
    settingsIcon.addEventListener("click", () => {
      if (settingsSound) {
        settingsSound.currentTime = 0;
        settingsSound.volume = 0.05;
        settingsSound.play().catch(() => {});
      }
      selector.style.display =
        selector.style.display === "none" ? "block" : "none";
    });
  }

  if (selector) {
    selector.addEventListener("change", (e) => {
      bgMusic.pause();
      bgMusic.src = e.target.value;
      bgMusic.currentTime = 0;
      if (!isMuted) bgMusic.play().catch(() => {});
    });
  }

  // --- INITIAL LOAD EVENT ---
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (!isMuted && audioUnlocked) {
        bgMusic.volume = 0.4;
        bgMusic.play().catch(() => {});
      }
    }, 1000);
  });

  // === PLAY BUTTON NAVIGATION ===
  const playButton = document.getElementById("play-button");
  if (playButton) {
    playButton.addEventListener("click", () => {
      // optional click sound later
      window.location.href = "/enter_code";
    });
  }



  setTimeout(updateProgress, 1000);
});
