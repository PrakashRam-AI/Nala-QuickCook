const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const inputFilePath = 'recipes.csv'; // Or the path to your raw dataset
const outputFilePath = 'clean_recipes.csv';

const cleanRows = [];
let rowCount = 0;
let skippedCount = 0;

fs.createReadStream(inputFilePath)
  .pipe(csv({ separator: '\t' }))  // Assuming it's tab-separated
  .on('data', (row) => {
    rowCount++;

    const name = row.RecipeName?.trim();
    const ingredients = row.Ingredients?.trim();
    const instructions = row.Instructions?.trim();
    const cuisine = row.Cuisine?.trim();

    if (name && ingredients && instructions) {
      cleanRows.push({ RecipeName: name, Ingredients: ingredients, Instructions: instructions, Cuisine: cuisine || 'Indian' });
    } else {
      skippedCount++;
      if (skippedCount <= 5) {
        console.log(`⚠️ Skipped Row ${rowCount}:`, row);  // Log first 5 problematic rows
      }
    }
  })
  .on('end', () => {
    if (cleanRows.length === 0) {
      console.error("❌ No clean rows found. Please check column names or encoding.");
      return;
    }

    const json2csv = new Parser();
    const csvData = json2csv.parse(cleanRows);
    fs.writeFileSync(outputFilePath, csvData);
    console.log(`✅ Created ${outputFilePath} with ${cleanRows.length} rows`);
  });
