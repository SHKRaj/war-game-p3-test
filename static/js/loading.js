// BASIC STRUCTURE DEVELOPED WITH CHATGPT ASSISTANCE
// ACTUAL CONSTRUCTION BY ME

document.addEventListener("DOMContentLoaded", function () {
  console.log("Script started");

  const counter = document.getElementById("loading-counter");
  const tip = document.getElementById("loading-tip");
  const main = document.getElementById("main-content");
  const loader = document.getElementById("loading-screen");

  if (!counter || !tip || !main || !loader) {
    console.error("Missing DOM element");
    return;
  }

  const tips = [
    "Allocating industrial contracts...",
    "Decrypting transmissions...",
    "Rearming expeditionary forces...",
    "Updating global intelligence feed...",
    "Syncing orbital telemetry...",
    "Verifying diplomatic credentials..."
  ];
  tip.innerText = tips[Math.floor(Math.random() * tips.length)];

  let progress = 0;

  function randomIncrement() {
    if (progress < 60) return Math.random() * 10 + 5;
    if (progress < 90) return Math.random() * 5 + 1;
    return Math.random() * 2 + 0.5;
  }

  function randomDelay() {
    return Math.random() * 400 + 100; // 100–500 ms per tick
  }

  function updateProgress() {
    progress += randomIncrement();
    if (progress > 100) progress = 100;

    counter.textContent = progress.toFixed(0) + "%";
    console.log("Progress:", progress);

    if (progress >= 100) {
      setTimeout(() => {
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

  setTimeout(updateProgress, 1000);
});
