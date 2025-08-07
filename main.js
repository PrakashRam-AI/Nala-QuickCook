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

  recipes.forEach(recipe => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ing && ing.trim() !== "") {
        ingredients.push(`${measure ? measure : ""} ${ing}`.trim());
      }
    }

    resultsDiv.innerHTML += `
      <div>
        <h3>${recipe.strMeal}</h3>
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;" />
        <p><strong>Ingredients:</strong> ${ingredients.join(", ")}</p>
        <p><strong>Instructions:</strong> ${recipe.strInstructions}</p>
        ${recipe.strYoutube ? `<p><a href="${recipe.strYoutube}" target="_blank">🎥 Watch Recipe Video</a></p>` : ""}
      </div><hr/>
    `;
  });
}
