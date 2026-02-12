// ===  PEASANT MODE ===
// i.e. For mobile Disables music + image-heavy visuals for slow devices

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("peasantModeToggle");
  const isPeasant = localStorage.getItem("peasantMode") === "true";

  if (isPeasant) toggle.checked = true;
  applyPeasantMode(isPeasant);

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    localStorage.setItem("peasantMode", enabled);
    applyPeasantMode(enabled);
    location.reload();
  });
});

function applyPeasantMode(enabled) {
  window.peasantMode = enabled;

  if (enabled) {
    // Kill all of their mobile audio sources
    document.querySelectorAll("audio").forEach(a => {
      a.pause();
      a.removeAttribute("src");
    });

    // Simplify visuals immediately
    document.body.classList.add("peasant-active");
    console.log("Peasant Mode: audio + heavy images disabled.");
  } else {
    document.body.classList.remove("peasant-active");
  }
}
