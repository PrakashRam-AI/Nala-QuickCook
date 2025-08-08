const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');

const inputFile = 'recipes.csv';
const outputFile = 'clean_recipes.csv';

const isASCII = (str) => /^[\x00-\x7F]*$/.test(str);

const results = [];

fs.createReadStream(inputFile)
  .pipe(csv({ separator: '\t' }))
  .on('data', (row) => {
    const recipeName = row.RecipeName?.trim() || '';
    const ingredients = row.Ingredients?.trim() || '';
    const instructions = row.Instructions?.trim() || '';

    if (
      recipeName &&
      ingredients &&
      instructions &&
      isASCII(recipeName) &&
      isASCII(ingredients) &&
      isASCII(instructions)
    ) {
      results.push({
        RecipeName: recipeName,
        Ingredients: ingredients,
        Instructions: instructions,
        Cuisine: row.Cuisine?.trim() || 'Indian'
      });
    }
  })
  .on('end', () => {
    stringify(results, {
      header: true,
      delimiter: '\t'
    }, (err, output) => {
      if (err) throw err;
      fs.writeFileSync(outputFile, output, 'utf8');
      console.log(`✅ Cleaned data written to ${outputFile}`);
    });
  });
