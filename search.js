async function searchRecipes() {
  const input = document.getElementById("ingredientInput").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!input) {
    resultsDiv.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  const recipes = await getRecipesByIngredient(input);

  if (recipes.length === 0) {
    resultsDiv.innerHTML = "<p>No recipes found for that ingredient.</p>";
    return;
  }

  const limitedRecipes = recipes.slice(0, 3); // Limit to 3 results

  for (const recipe of limitedRecipes) {
    const videoLink = await fetchYouTubeVideo(recipe.strMeal || recipe.name);

    resultsDiv.innerHTML += `
      <div>
        <h3>${recipe.strMeal || recipe.name}</h3>
        <img src="${recipe.strMealThumb || recipe.image}" alt="${recipe.strMeal || recipe.name}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;" />
        <p><strong>Ingredients:</strong> ${recipe.strIngredients?.join(", ") || recipe.ingredients?.join(", ") || "N/A"}</p>
        <p><strong>Instructions:</strong> ${recipe.strInstructions || recipe.instructions || "N/A"}</p>
        ${videoLink ? `<p><a href="${videoLink}" target="_blank">🎥 Watch Recipe Video</a></p>` : `<p>No video available</p>`}
      </div><hr/>
    `;
  }
}
