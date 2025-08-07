async function searchRecipes() {
  const inputField = document.getElementById("ingredientInput");
  const regionSelect = document.getElementById("regionSelect");
  const input = inputField.value.trim().toLowerCase();
  const selectedRegion = regionSelect.value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!input) {
    resultsDiv.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  // ✅ Save preferences to localStorage
  localStorage.setItem("lastIngredient", input);
  localStorage.setItem("lastRegion", selectedRegion);

  const recipes = await getRecipesByIngredient(input);

  if (recipes.length === 0) {
    resultsDiv.innerHTML = "<p>No recipes found for that ingredient.</p>";
    return;
  }

  const limitedRecipes = recipes.slice(0, 3); // ✅ Limit to 3 results

  for (const recipe of limitedRecipes) {
    const videoLink = await fetchYouTubeVideo(recipe.strMeal || recipe.name);

    // ✅ Extract ingredients from strIngredient1 to strIngredient20
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push(`${measure ? measure.trim() : ""} ${ing.trim()}`.trim());
      }
    }

    resultsDiv.innerHTML += `
      <div>
        <h3>${recipe.strMeal || recipe.name}</h3>
        <img src="${recipe.strMealThumb || recipe.image}" alt="${recipe.strMeal || recipe.name}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;" />
        <p><strong>Ingredients:</strong> ${ingredients.join(", ")}</p>
        <p><strong>Instructions:</strong> ${recipe.strInstructions || recipe.instructions || "N/A"}</p>
        ${videoLink ? `<p><a href="${videoLink}" target="_blank">🎥 Watch Recipe Video</a></p>` : `<p>No video available</p>`}
      </div><hr/>
    `;
  }
}

// ✅ Load saved preferences when the page loads
function loadPreferences() {
  const inputField = document.getElementById("ingredientInput");
  const regionSelect = document.getElementById("regionSelect");

  const savedIngredient = localStorage.getItem("lastIngredient");
  const savedRegion = localStorage.getItem("lastRegion");

  if (savedIngredient) inputField.value = savedIngredient;
  if (savedRegion) regionSelect.value = savedRegion;
}

// ✅ Add Enter key support
document.addEventListener("DOMContentLoaded", () => {
  loadPreferences();

  document
    .getElementById("ingredientInput")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        searchRecipes();
      }
    });
});
