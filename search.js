let currentUtterance = null;
let isPaused = false;

// ✅ Preload voices on Chrome
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

// ✅ Expand common cooking abbreviations
function expandAbbreviations(text) {
  return text
    .replace(/\btbs\b/gi, "tablespoon")
    .replace(/\btbsp\b/gi, "tablespoon")
    .replace(/\btsp\b/gi, "teaspoon")
    .replace(/\bkg\b/gi, "kilogram")
    .replace(/\bg\b/gi, "gram")
    .replace(/\bml\b/gi, "milliliter")
    .replace(/\bcms\b/gi, "centimeters")
    .replace(/\bltrs\b/gi, "liters");
}

// ✅ Read aloud the recipe
function readRecipeAloud(recipeName, ingredients, instructions) {
  // Cancel current speech if any
  if (speechSynthesis.speaking || isPaused) {
    speechSynthesis.cancel();
  }

  const message = `The recipe is for ${recipeName}. 
  To make this dish, you'll need: ${expandAbbreviations(ingredients.join(", "))}. 
  Here's how it's made: ${expandAbbreviations(instructions)}`;

  currentUtterance = new SpeechSynthesisUtterance(message);
  currentUtterance.lang = 'en-IN';
  currentUtterance.pitch = 1;
  currentUtterance.rate = 0.9;

  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    voice => voice.lang.startsWith("en") && (voice.name.includes("Female") || voice.name.includes("Google"))
  );
  if (preferredVoice) {
    currentUtterance.voice = preferredVoice;
  }

  isPaused = false;
  speechSynthesis.speak(currentUtterance);
}

// ✅ Toggle pause/resume
function toggleSpeech() {
  if (!speechSynthesis.speaking && !isPaused) return;

  if (isPaused) {
    speechSynthesis.resume();
    isPaused = false;
  } else {
    speechSynthesis.pause();
    isPaused = true;
  }
}

// ✅ Stop speech
function stopSpeech() {
  if (speechSynthesis.speaking || isPaused) {
    speechSynthesis.cancel();
    isPaused = false;
    currentUtterance = null;
  }
}

async function searchRecipes() {
  const input = document.getElementById("ingredientInput").value.trim().toLowerCase();
  const region = document.getElementById("regionSelect").value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!input) {
    resultsDiv.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  // ✅ Save only region preference
  savePreferences(region);

  let recipes = await getRecipesByIngredient(input);
  recipes = recipes.filter(recipe => recipe && (recipe.strMeal || recipe.name));
  const limitedRecipes = recipes.slice(0, 3);

  if (limitedRecipes.length === 0) {
    resultsDiv.innerHTML = "<p>No recipes found for that ingredient.</p>";
    return;
  }

  for (const recipe of limitedRecipes) {
    const videoLink = await fetchYouTubeVideo(recipe.strMeal || recipe.name);

    // ✅ Extract ingredients
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
      <div style="margin-bottom: 20px;">
        <h3 style="display: flex; align-items: center; justify-content: space-between;">
          <span>${recipeName}</span>
          <span style="display: flex; gap: 10px; align-items: center;">
            <button onclick='readRecipeAloud(${JSON.stringify(recipeName)}, ${JSON.stringify(ingredients)}, ${JSON.stringify(instructions)})' title="Read Aloud" style="font-size: 18px; background: none; border: none; cursor: pointer;">🔊</button>
            <button onclick='toggleSpeech()' title="Pause/Resume" style="font-size: 18px; background: none; border: none; cursor: pointer;">⏯️</button>
            <button onclick='stopSpeech()' title="Stop" style="font-size: 18px; background: none; border: none; cursor: pointer;">🛑</button>
          </span>
        </h3>
        <img src="${recipe.strMealThumb || recipe.image}" alt="${recipeName}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;" />
        <p><strong>Ingredients:</strong> ${ingredients.join(", ")}</p>
        <p><strong>Instructions:</strong> ${instructions}</p>
        ${videoLink ? `<p><a href="${videoLink}" target="_blank">🎥 Watch Recipe Video</a></p>` : `<p>No video available</p>`}
      </div><hr/>
    `;
  }
}
