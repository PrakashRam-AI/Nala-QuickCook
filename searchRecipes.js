const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

// Connect to SQLite database
const db = new sqlite3.Database('./recipe.sqlite');

// Set up user input interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for search input
rl.question('🔍 Search by keyword (ingredient/cuisine): ', (keyword) => {
  rl.question('📂 Optional filter - Cuisine (press enter to skip): ', (cuisineFilter) => {
    rl.question('🥗 Optional filter - Diet (press enter to skip): ', (dietFilter) => {
      rl.question('🍽️ Optional filter - Course (press enter to skip): ', (courseFilter) => {
        
        // Build dynamic query
        let query = `
          SELECT 
            TranslatedIngredients, 
            TranslatedInstructions, 
            Cuisine,
            PrepTimeInMins,
            CookTimeInMins,
            Diet,
            Course
          FROM recipe
          WHERE (TranslatedIngredients LIKE ? OR Cuisine LIKE ?)
        `;
        const params = [`%${keyword}%`, `%${keyword}%`];

        if (cuisineFilter) {
          query += ` AND Cuisine LIKE ?`;
          params.push(`%${cuisineFilter}%`);
        }

        if (dietFilter) {
          query += ` AND Diet LIKE ?`;
          params.push(`%${dietFilter}%`);
        }

        if (courseFilter) {
          query += ` AND Course LIKE ?`;
          params.push(`%${courseFilter}%`);
        }

        query += ` LIMIT 50`;

        // Run the query
        db.all(query, params, (err, rows) => {
          if (err) {
            console.error('❌ Database error:', err.message);
          } else if (rows.length === 0) {
            console.log('❌ No matching recipes found.');
          } else {
            console.log(`\n✅ Found ${rows.length} matching recipes:\n`);

            rows.forEach((row, i) => {
              const ingredients = row.TranslatedIngredients?.split(',').slice(0, 3).join(', ') + '...';
              const instructions = row.TranslatedInstructions?.split(' ').slice(0, 20).join(' ') + '...';
              const cuisine = row.Cuisine || 'Unknown';
              const diet = row.Diet || 'Unspecified';
              const course = row.Course || 'N/A';
              const prep = row.PrepTimeInMins || 0;
              const cook = row.CookTimeInMins || 0;
              const total = Number(prep) + Number(cook);

              console.log(`${i + 1}. 🍲 ${cuisine} | 🥗 ${diet} | 🍽️ ${course}`);
              console.log(`   🧂 Ingredients: ${ingredients}`);
              console.log(`   ⏱️ Prep: ${prep} mins | Cook: ${cook} mins | Total: ${total} mins`);
              console.log(`   📝 Instructions: ${instructions}\n`);
            });
          }

          rl.close();
          db.close();
        });
      });
    });
  });
});
