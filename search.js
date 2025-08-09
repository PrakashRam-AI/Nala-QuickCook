// search.js — QuickCook (Nalan 🍲)
// Uses Render API, shows top 3 recipes, embeds YouTube via youtube.js, and supports TTS.

import { getYoutubeEmbedFor } from "./youtube.js";

const API_BASE = "https://nala-api-co3e.onrender.com"; // ✅ your live backend

let currentUtterance = null;
let isPaused = false;

// ---------- TTS ----------
function loadVoices() {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
  });
}

async function speak(text, lang = "en-IN") {
  if (!text) return;
  await loadVoices();

  if (currentUtterance && isPaused) {
    speechSynthesis.resume();
    isPaused = false;
    return;
  }
  if (speechSynthesis.speaking) speechSynthesis.cancel();

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = lang; // later: hi-IN, ta-IN
  currentUtterance.rate = 1.0;
  currentUtterance.pitch = 1.0;
  speechSynthesis.speak(currentUtterance);
}

function pauseSpeech() {
  if (speechSynthesis.speaking) {
    speechSynthesis.pause();
    isPaused = true;
  }
}

function stopSpeech() {
  speechSynthesis.cancel();
  currentUtterance = null;
  isPaused = false;
}

// ---------- API ----------
async function fetchRecipes(ingredient) {
  const url = `${API_BASE}/search?q=${encodeURIComponent(ingredient.trim().toLowerCase())}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ---------- UI Bindings ----------
document.getElementById("searchBtn")?.addEventListener("click", onSearch);
document.getElementById("ingredientInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onSearch();
});

// If you have a mic button elsewhere, wire it to set #ingredientInput and call onSearch()

async function onSearch() {
  stopSpeech();
  const ingredient = (document.getElementById("ingredientInput")?.value || "").trim();
  if (!ingredient) return showMessage("Please enter an ingredient.");

  showMessage("Searching...");
  try {
    const data = await fetchRecipes(ingredient);

    // Double-guard to top 3 (server already slices, but harmless)
    const top3 = data.slice(0, 3);

    await renderResults(top3);
    showMessage(`${top3.length} recipe(s) found.`);
  } catch (err) {
    console.error(err);
    showMessage("Error fetching recipes. Try again.");
  }
}

function showMessage(msg) {
  const el = document.getElementById("message");
  if (el) el.textContent = msg;
}

// ---------- Rendering ----------
async function renderResults(recipes = []) {
  const container = document.getElementById("results");
  if (!container) return;
  container.innerHTML = "";

  if (!recipes.length) {
    container.innerHTML = `<div class="empty">No recipes found under 30 mins.</div>`;
    return;
  }

  // Pre-fetch YouTube embeds in parallel
  const embeds = await Promise.all(
    recipes.map((r) => getYoutubeEmbedFor((r.name || "").toString()))
  );

  recipes.forEach((r, idx) => {
    const title = r.name || "Unknown Dish";
    const ingredients = r.TranslatedIngredients || "";
    const instructions = r.TranslatedInstructions || "";
    const total = r.TotalTimeInMins ?? "—";

    // Optional fallback image if missing/blank
    const imgSrc = r.image && r.image.trim() ? r.image : "assets/fallback-recipe.jpg";

    const embed = embeds[idx];
    const videoHtml = embed
      ? `<iframe width="100%" height="215" src="${embed}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      : `<a class="youtube" href="https://www.youtube.com/results?search_query=${encodeURIComponent(title + " recipe")}" target="_blank" rel="noopener">▶️ Video</a>`;

    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <div class="recipe-media">
        <img src="${imgSrc}" alt="${title}" loading="lazy" />
      </div>
      <div class="recipe-body">
        <h3>${title}</h3>
        <div class="meta">Total time: ${total} mins</div>
        <div class="section"><strong>Ingredients:</strong><br>${ingredients}</div>
        <div class="section"><strong>Instructions:</strong><br>${instructions}</div>
        <div class="video">${videoHtml}</div>
        <div class="actions">
          <button class="speak" aria-label="Read recipe">🔊 Read</button>
          <button class="pause" aria-label="Pause reading">⏸️ Pause</button>
          <button class="stop" aria-label="Stop reading">⏹️ Stop</button>
        </div>
      </div>
    `;

    card.querySelector(".speak").addEventListener("click", () => {
      const narration =
        `${title}. Total time ${total} minutes. Ingredients: ${ingredients}. Steps: ${instructions}`;
      speak(narration, "en-IN");
    });
    card.querySelector(".pause").addEventListener("click", pauseSpeech);
    card.querySelector(".stop").addEventListener("click", stopSpeech);

    container.appendChild(card);
  });
}
