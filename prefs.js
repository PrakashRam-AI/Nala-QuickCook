// Save preferences when user searches
function savePreferences(ingredient, region) {
  localStorage.setItem("lastIngredient", ingredient);
  localStorage.setItem("lastRegion", region);
}

// Load preferences on page load
function loadPreferences() {
  const lastIngredient = localStorage.getItem("lastIngredient");
  const lastRegion = localStorage.getItem("lastRegion");

  if (lastIngredient) {
    document.getElementById("ingredientInput").value = lastIngredient;
  }
  if (lastRegion) {
    document.getElementById("regionSelect").value = lastRegion;
  }
}

// Call loadPreferences once DOM is fully ready
window.addEventListener("DOMContentLoaded", loadPreferences);
