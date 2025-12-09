// === GLOBAL AUDIO CONTROLLER ===
// Keeps background music + mute/settings persistent across all pages

document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = document.getElementById("bg-music");
  const muteBtn = document.getElementById("mute-toggle");
  const settingsIcon = document.getElementById("settings-icon");
  const selector = document.getElementById("music-selector");

  window.iconMute = window.iconMute || "/static/icons/mute.svg";
  window.iconUnmute = window.iconUnmute || "/static/icons/unmute.svg";

  if (!bgMusic) return;

  // --- RESTORE STATE ---
  let isMuted = localStorage.getItem("musicMuted") === "true";
  let audioUnlocked = localStorage.getItem("audioUnlocked") === "true";

  bgMusic.volume = parseFloat(localStorage.getItem("musicVolume")) || 0.4;
  bgMusic.loop = true;

  const savedSrc = localStorage.getItem("bgMusicSrc");
  if (savedSrc) {
    bgMusic.src = savedSrc;
    if (selector) selector.value = savedSrc;
  }

  const savedTime = parseFloat(localStorage.getItem("bgMusicTime"));
  if (!isNaN(savedTime) && savedTime > 0) {
    bgMusic.currentTime = savedTime;
  }

  // --- SAVE PLAYBACK POSITION ---
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("bgMusicTime", bgMusic.currentTime);
  });

  // --- UNLOCK AUDIO ---
  function unlockAudio() {
    if (!audioUnlocked) {
      localStorage.setItem("audioUnlocked", "true");
      if (!isMuted) bgMusic.play().catch(() => {});
      audioUnlocked = true;
    }
  }

  // trigger unlock by click or keypress
  document.body.addEventListener("click", unlockAudio, { once: true });
  document.body.addEventListener("keydown", unlockAudio, { once: true });

  // --- RESUME IF ALREADY UNLOCKED ---
  if (audioUnlocked && !isMuted) {
    bgMusic.play().catch(() => {});
  }

  // --- ICONS ---
  function updateIcon() {
    if (muteBtn) muteBtn.src = isMuted ? window.iconMute : window.iconUnmute;
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      isMuted = !isMuted;
      localStorage.setItem("musicMuted", isMuted);
      updateIcon();
      if (isMuted) bgMusic.pause();
      else bgMusic.play().catch(() => {});
    });
  }

    // --- SETTINGS MENU ---
  if (settingsIcon && selector) {
    const clickSound = document.getElementById("settings-click");
    clickSound.volume = 0.05;

    settingsIcon.addEventListener("click", () => {
        // Play click sound
        if (clickSound) {
        // Play quietly, respect mute setting
        clickSound.currentTime = 0;
        if (!isMuted) clickSound.play().catch(() => {});
        }

        // Toggle visibility
        selector.style.display =
        selector.style.display === "none" ? "block" : "none";
    });
    }

  // --- MUSIC SWITCHER ---
  if (selector) {
    selector.addEventListener("change", (e) => {
      const newSrc = e.target.value;
      localStorage.setItem("bgMusicSrc", newSrc);
      bgMusic.pause();
      bgMusic.src = newSrc;
      bgMusic.currentTime = 0;
      if (!isMuted) bgMusic.play().catch(() => {});
    });
  }

  updateIcon();
});
