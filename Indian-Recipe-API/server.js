const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

// Enable CORS so frontend can call this
app.use(cors());

// ✅ Use the correct DB path inside the repo
const db = new sqlite3.Database("./data/recipe.sqlite", (err) => {
  if (err) {
    console.error("❌ Error connecting to database:", err.message);
  } else {
    console.log("✅ Connected to ./data/recipe.sqlite");
  }
});

// 🔍 Extract recipe title from instruction text
function extractTitleFromInstructions(instruction = "") {
  const match = instruction.match(/to begin.*?making\s+(.*?),/i);
  if (match) {
    const rawTitle = match[1].trim();
    return rawTitle.replace(/^the\s+/i, "").trim();
  }
  return "Unknown Dish";
}

// Root route for testing
app.get("/", (req, res) => {
  res.send("🍳 QuickCook Backend is running.");
});

// Main API endpoint (ingredient param key = q)
app.get("/search", (req, res) => {
  const ingredient = req.query.q?.toLowerCase();
  if (!ingredient) {
    return res.status(400).json({ error: "Missing 'q' query parameter." });
  }

  const query = `
    SELECT * FROM recipe
    WHERE lower(TranslatedIngredients) LIKE ?
  `;

  db.all(query, [`%${ingredient}%`], (err, rows) => {
    if (err) {
      console.error("❌ DB error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    const filtered = rows
      .filter((row) => {
        const prep = parseInt(row.PrepTimeInMins || 0, 10);
        const cook = parseInt(row.CookTimeInMins || 0, 10);
        return prep + cook <= 30;
      })
      .map((row) => ({
        name: extractTitleFromInstructions(row.TranslatedInstructions),
        image: "", // Placeholder for now (fallback handled on frontend)
        ...row,
        TotalTimeInMins:
          parseInt(row.PrepTimeInMins || 0, 10) +
          parseInt(row.CookTimeInMins || 0, 10),
      }))
      .slice(0, 3); // ✅ return only top 3

    res.json(filtered);
  });
});

// 🔖 Version marker (shows in Render logs)
console.log("🚀 Backend version: 2025-08-09-03");

// ❗ Do NOT app.listen here. bin/www will start the server.
module.exports = app;
