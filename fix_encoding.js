const fs = require('fs');

const input = 'parsed_recipes.csv';
const output = 'clean_recipes.csv';

let text = fs.readFileSync(input, 'utf8');

// Fix common UTF-8 issues
text = text
  .replace(/Â/g, '')
  .replace(/Ã/g, ' ')
  .replace(/\u00a0/g, ' ') // Non-breaking space
  .replace(/“|”/g, '"')
  .replace(/‘|’/g, "'")
  .replace(/–/g, '-')
  .replace(/…/g, '...');

// Write cleaned content
fs.writeFileSync(output, text, 'utf8');
console.log('✅ Encoding glitches fixed. Output saved to clean_recipes.csv');
