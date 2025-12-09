// --- INTRO PAGE LOADER ---
// Now works with Flask base.html inheritance

document.addEventListener("DOMContentLoaded", function () {
  const counter = document.getElementById("loading-counter");
  const tip = document.getElementById("loading-tip");
  const main = document.getElementById("main-content");
  const loader = document.getElementById("loading-screen");
  const bg = document.getElementById("loading-bg");
  const loadingLogo = document.querySelector(".loading-logo");

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

  // Background rotation
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
    setInterval(changeBackground, 3000 + Math.random() * 2000);
  }

  // --- Progress illusion ---
  function randomIncrement() {
    if (progress < 60) return Math.random() * 5 + 2;
    if (progress < 90) return Math.random() * 3 + 1;
    return Math.random() * 2 + 0.5;
  }

  function randomDelay() {
    return Math.random() * 400 + 100;
  }

  function updateProgress() {
    progress += randomIncrement();
    if (progress > 100) progress = 100;
    counter.textContent = progress.toFixed(0) + "%";

    if (progress >= 100) {
      setTimeout(() => {
        if (loadingLogo) loadingLogo.classList.add("move-top-left");
        if (completeSound) {
          completeSound.volume = 0.3;
          completeSound.play().catch(() => {});
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

  // Rotate hints
  setInterval(() => {
    tip.innerText = tips[Math.floor(Math.random() * tips.length)];
  }, 3000);

  // Navigate to next page
  const playButton = document.getElementById("play-button");
  if (playButton) {
    playButton.addEventListener("click", () => {
      window.location.href = "/enter_code";
    });
  }

  // Start loading animation
  setTimeout(updateProgress, 1000);
});
