const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const port = 3000;

// Enable CORS so frontend can call this
app.use(cors());

// Connect to the SQLite database
const db = new sqlite3.Database("recipe.sqlite", (err) => {
  if (err) {
    console.error("❌ Error connecting to database:", err.message);
  } else {
    console.log("✅ Connected to recipe.sqlite database");
  }
});

// 🔍 Extract recipe title from instruction text
function extractTitleFromInstructions(instruction) {
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

// Main API endpoint
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
      res.status(500).json({ error: "Database error" });
    } else {
      const filtered = rows
        .filter((row) => {
          const prep = parseInt(row.PrepTimeInMins || 0);
          const cook = parseInt(row.CookTimeInMins || 0);
          return prep + cook <= 30;
        })
        .map((row) => ({
          name: extractTitleFromInstructions(row.TranslatedInstructions),
          image: "", // Placeholder for now
          ...row,
          TotalTimeInMins:
            parseInt(row.PrepTimeInMins || 0) + parseInt(row.CookTimeInMins || 0),
        }));

      res.json(filtered);
    }
  });
});

// Start server
console.log("🚀 Backend version: 2025-08-09-01");

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
