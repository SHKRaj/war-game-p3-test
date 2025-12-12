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
  const hasVisited = sessionStorage.getItem("hasVisitedIntro");
  const backgrounds = window.backgrounds || [];
  let progress = 0;
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
          sessionStorage.setItem("hasVisitedIntro", "true");
        }, 1000);
      }, 1000);
    } else {
      setTimeout(updateProgress, randomDelay());
    }
  }

  function runIntro() {
    if (backgrounds.length > 0) {
      bg.style.backgroundImage = `url(${backgrounds[0]})`;
      setInterval(changeBackground, 3000 + Math.random() * 2000);
    }
    setInterval(() => {
      tip.innerText = tips[Math.floor(Math.random() * tips.length)];
    }, 3000);
    setTimeout(updateProgress, 1000);
  }

  if (hasVisited) {
    loader.style.display = "none";
    main.style.display = "block";
    document.body.style.overflow = "auto";
  } else {
    runIntro();
  }

  const playButton = document.getElementById("play-button");
  if (playButton) {
    playButton.addEventListener("click", () => {
      window.location.href = "/enter_code";
    });
  }

  const globalBtn = document.getElementById("global-button");
  if (globalBtn) {
    globalBtn.addEventListener("click", () => {
      window.location.href = "/global";
    });
  }

  const allyBtn = document.getElementById("alliance-button");
  if (allyBtn) {
    allyBtn.addEventListener("click", () => {
      window.location.href = "/alliances";
    });
  }

  const warBtn = document.getElementById("war-button");
  const warModal = document.getElementById("war-modal");
  const warBody = document.getElementById("war-body");
  const closeWar = document.getElementById("close-war-modal");

  if (warBtn) {
    warBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/war_list");
        const data = await res.json();
        if (!data.wars || data.wars.length === 0) {
          warBody.innerHTML = "<p>No active conflicts detected.</p>";
        } else {
          warBody.innerHTML = data.wars.map(w => `
            <div class="war-card">
              <h3>${w.Name || "Unnamed Conflict"}</h3>
              <p>${w.Desc || ""}</p>
              ${w.Sides ? `
                <ul>${w.Sides.map(side => `
                  <li><b>${side.Name}</b> — ${side.Nations || "?"}</li>
                `).join("")}</ul>
              ` : ""}
            </div>
          `).join("");
        }
        warModal.style.display = "flex";
      } catch (err) {
        warBody.innerHTML = `<p style="color:#ff4444;">Error loading wars: ${err}</p>`;
        warModal.style.display = "flex";
      }
    });
  }

  if (closeWar) closeWar.addEventListener("click", () => {
    warModal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === warModal) warModal.style.display = "none";
  });
});
