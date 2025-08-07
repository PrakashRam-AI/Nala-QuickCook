function readRecipeAloud(recipeName, ingredients, instructions) {
  const message = `The recipe is for ${recipeName}. 
  To make this dish, you'll need: ${ingredients.join(", ")}. 
  Here's how it's made: ${instructions}`;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-IN'; // Indian English accent
  utterance.pitch = 1;
  utterance.rate = 0.9;
  utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes("Female") || voice.name.includes("Google"));

  speechSynthesis.speak(utterance);
}

async function searchRecipes() {
  const input = document.getElementById("ingredientInput").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!input) {
    resultsDiv.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  let recipes = await getRecipesByIngredient(input);

  recipes = recipes.filter(recipe => recipe && (recipe.strMeal || recipe.name));
  const limitedRecipes = recipes.slice(0, 3);

  if (limitedRecipes.length === 0) {
    resultsDiv.innerHTML = "<p>No recipes found for that ingredient.</p>";
    return;
  }

  for (const recipe of limitedRecipes) {
    const videoLink = await fetchYouTubeVideo(recipe.strMeal || recipe.name);

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push(`${measure ? measure.trim() : ""} ${ing.trim()}`.trim());
      }
    }

    const recipeName = recipe.strMeal || recipe.name;
    const instructions = recipe.strInstructions || recipe.instructions || "Instructions not available";

    resultsDiv.innerHTML += `
      <div>
        <h3>
          ${recipeName}
          <button 
            onclick='readRecipeAloud(${JSON.stringify(recipeName)}, ${JSON.stringify(ingredients)}, ${JSON.stringify(instructions)})' 
            style="margin-left: 10px; font-size: 18px;" 
            title="Read Aloud"
          >
            🔊
          </button>
        </h3>
        <img src="${recipe.strMealThumb || recipe.image}" alt="${recipeName}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;" />
        <p><strong>Ingredients:</strong> ${ingredients.join(", ")}</p>
        <p><strong>Instructions:</strong> ${instructions}</p>
        ${videoLink ? `<p><a href="${videoLink}" target="_blank">🎥 Watch Recipe Video</a></p>` : `<p>No video available</p>`}
      </div><hr/>
    `;
  }
}
