// === POOR PEASANT MODE ===
// Disables background music + heavy visuals for slow devices + made with CHAT GPT

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("peasantModeToggle");
  const isPeasant = localStorage.getItem("peasantMode") === "true";

  // Set initial toggle state
  if (isPeasant) toggle.checked = true;

  // Apply mode immediately
  applyPeasantMode(isPeasant);

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    localStorage.setItem("peasantMode", enabled);
    applyPeasantMode(enabled);
    location.reload(); // reload to apply cleanly
  });
});

function applyPeasantMode(enabled) {
  // Save flag globally so other scripts can detect it
  window.peasantMode = enabled;

  // Disable all <audio> elements if peasant mode is on
  if (enabled) {
    document.querySelectorAll("audio").forEach(a => {
      a.pause();
      a.removeAttribute("src");
    });
    console.log("🪫 Peasant Mode active: all audio disabled.");
  }
}
