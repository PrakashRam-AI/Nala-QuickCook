// Save preferences when user searches
function savePreferences(ingredient, region) {
  localStorage.setItem("lastIngredient", ingredient);
  localStorage.setItem("lastRegion", region);
}

// Load preferences when page loads
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

// Call on page load
window.onload = loadPreferences;
