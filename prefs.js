// ✅ Save only the region preference
function savePreferences(region) {
  localStorage.setItem("lastRegion", region);
}

// ✅ Load region preference on page load
function loadPreferences() {
  const lastRegion = localStorage.getItem("lastRegion");

  if (lastRegion) {
    const regionSelect = document.getElementById("regionSelect");
    if (regionSelect) regionSelect.value = lastRegion;
  }
}

// ✅ Load preferences only when DOM is ready
window.addEventListener("DOMContentLoaded", loadPreferences);
