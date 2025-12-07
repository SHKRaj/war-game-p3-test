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
        completeSound.volume = 0.25;
        completeSound.play();
      }

      const loadingLogo = document.querySelector(".loading-logo");
      const uiLogo = document.querySelector(".ui-logo");

      loader.style.transition = "opacity 1s ease";
      loader.style.opacity = 0;
      if (loadingLogo) loadingLogo.style.transition = "opacity 1s ease";
      if (loadingLogo) loadingLogo.style.opacity = 0;

      setTimeout(() => {
        loader.style.display = "none";
        if (loadingLogo) loadingLogo.style.display = "none";
        if (uiLogo) uiLogo.style.display = "block";
        main.style.display = "block";
        document.body.style.overflow = "auto";
      }, 1000);
    }, 1000);
  } else {
    setTimeout(updateProgress, randomDelay());
  }
}

  // background music & mute toggle
  const bgMusic = document.getElementById("bg-music");
  const muteBtn = document.getElementById("mute-toggle");
  let isMuted = false;
  updateIcon();

  function updateIcon() {
    muteBtn.src = isMuted ? window.iconMute : window.iconUnmute;
  }

  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    updateIcon();
    if (isMuted) bgMusic.pause();
    else bgMusic.play();
  });

  // settings and dropdown
  const settingsIcon = document.getElementById("settings-icon");
  const settingsSound = document.getElementById("settings-sound");
  const selector = document.getElementById("music-selector");

  if (settingsIcon) {
    settingsIcon.addEventListener("click", () => {
      if (settingsSound) {
        settingsSound.currentTime = 0;
        settingsSound.volume = 0.05; // soft click
        settingsSound.play();
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
      if (!isMuted) bgMusic.play();
    });
  }

  // start background music after loading
  window.addEventListener("load", () => {
    setTimeout(() => {
      bgMusic.volume = 0.4;
      if (!isMuted) bgMusic.play();
    }, 1000);
  });

  setTimeout(updateProgress, 1000);
});
