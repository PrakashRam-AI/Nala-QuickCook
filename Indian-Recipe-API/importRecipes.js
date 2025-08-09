const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const db = new sqlite3.Database('./recipe.sqlite');

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS recipe`);
  db.run(`CREATE TABLE recipe (
    TranslatedIngredients TEXT,
    TranslatedInstructions TEXT,
    Cuisine TEXT,
    PrepTimeInMins INTEGER,
    CookTimeInMins INTEGER,
    TotalTimeInMins INTEGER,
    Diet TEXT,
    Course TEXT
  )`);

  fs.createReadStream('parsed_recipes.csv')
    .pipe(csv({ separator: ',' }))
    .on('data', (row) => {
      const {
        TranslatedIngredients,
        TranslatedInstructions,
        Cuisine,
        PrepTimeInMins,
        CookTimeInMins,
        TotalTimeInMins,
        Diet,
        Course
      } = row;

      db.run(
        `INSERT INTO recipe (
          TranslatedIngredients,
          TranslatedInstructions,
          Cuisine,
          PrepTimeInMins,
          CookTimeInMins,
          TotalTimeInMins,
          Diet,
          Course
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          TranslatedIngredients || '',
          TranslatedInstructions || '',
          Cuisine || '',
          parseInt(PrepTimeInMins) || 0,
          parseInt(CookTimeInMins) || 0,
          parseInt(TotalTimeInMins) || 0,
          Diet || '',
          Course || ''
        ]
      );
    })
    .on('end', () => {
      console.log('✅ parsed_recipes.csv imported with full schema!');
      db.close();
    });
});
