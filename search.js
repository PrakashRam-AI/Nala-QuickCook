let currentUtterance = null;
let isPaused = false;

// ✅ Load voices fully before using them
function loadVoices() {
  return new Promise(resolve => {
    let voices = speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);

    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      resolve(voices);
    };
  });
}

// ✅ Expand abbreviations in TTS
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

// ✅ Read Recipe Aloud
async function readRecipeAloud(recipeName, ingredients, instructions) {
  if (speechSynthesis.speaking || speechSynthesis.paused) {
    speechSynthesis.cancel();
  }

  const voices = await loadVoices();
  const preferredVoice = voices.find(v =>
    v.lang.startsWith('en') &&
    (v.name.includes("Female") || v.name.includes("Google") || v.name.includes("India"))
  );

  const message = `The recipe is for ${recipeName}. 
    You will need: ${expandAbbreviations(ingredients)}.
    Here's how to cook it: ${expandAbbreviations(instructions)}`;

  currentUtterance = new SpeechSynthesisUtterance(message);
  currentUtterance.lang = 'en-US';
  currentUtterance.pitch = 1;
  currentUtterance.rate = 0.9;

  if (preferredVoice) currentUtterance.voice = preferredVoice;

  speechSynthesis.speak(currentUtterance);
  isPaused = false;
}

function toggleSpeech() {
  if (!speechSynthesis.speaking) return;

  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    isPaused = false;
  } else {
    speechSynthesis.pause();
    isPaused = true;
  }
}

function stopSpeech() {
  if (speechSynthesis.speaking || speechSynthesis.paused) {
    speechSynthesis.cancel();
    isPaused = false;
  }
}

// ✅ Search and Render
async function searchRecipes() {
  const input = document.getElementById("ingredientInput").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!input) {
    resultsDiv.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/search?q=${input}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      resultsDiv.innerHTML = "<p>No recipes available.</p>";
      return;
    }

    const top3 = data.slice(0, 3);

    for (const recipe of top3) {
      const videoLink = await fetchYouTubeVideo(recipe.name);
      const imageHTML = recipe.image
        ? `<img src="${recipe.image}" alt="${recipe.name}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;" />`
        : "";

      resultsDiv.innerHTML += `
        <div style="margin-bottom: 20px;">
          <h3 style="display: flex; align-items: center; justify-content: space-between;">
            <span>${recipe.name}</span>
            <span style="display: flex; gap: 10px; align-items: center;">
              <button onclick='readRecipeAloud(${JSON.stringify(recipe.name)}, ${JSON.stringify(recipe.TranslatedIngredients)}, ${JSON.stringify(recipe.TranslatedInstructions)})' title="Read Aloud" style="font-size: 18px; background: none; border: none; cursor: pointer;">🔊</button>
              <button onclick='toggleSpeech()' title="Pause/Resume" style="font-size: 18px; background: none; border: none; cursor: pointer;">⏯️</button>
              <button onclick='stopSpeech()' title="Stop" style="font-size: 18px; background: none; border: none; cursor: pointer;">🛑</button>
            </span>
          </h3>
          ${imageHTML}
          <p><strong>Ingredients:</strong> ${recipe.TranslatedIngredients}</p>
          <p><strong>Instructions:</strong> ${recipe.TranslatedInstructions}</p>
          ${
            videoLink
              ? `<p><a href="${videoLink}" target="_blank">🎥 Watch Recipe Video</a></p>`
              : `<p><i>No video available</i></p>`
          }
        </div><hr/>
      `;
    }
  } catch (err) {
    console.error("❌ Error:", err);
    resultsDiv.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}
