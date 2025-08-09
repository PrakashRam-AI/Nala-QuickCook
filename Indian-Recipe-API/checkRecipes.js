const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./recipe.sqlite');

db.all('SELECT RecipeName FROM recipe LIMIT 5', [], (err, rows) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('🔍 Sample Recipes:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.RecipeName}`);
    });
  }
  db.close();
});
