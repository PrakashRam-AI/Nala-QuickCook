import csv
import re

input_file = 'raw_hf_recipes.csv'
output_file = 'parsed_recipes.csv'

fields = [
    'TranslatedIngredients', 'TranslatedInstructions', 'Cuisine',
    'PrepTimeInMins', 'CookTimeInMins', 'TotalTimeInMins',
    'Diet', 'Course'
]

pattern_map = {
    field: re.compile(rf'### {field}:\s*(.*?)\s*(?=###|$)', re.DOTALL)
    for field in fields
}

def parse_text_block(text):
    row_data = {}
    for field, pattern in pattern_map.items():
        match = pattern.search(text)
        row_data[field] = match.group(1).strip() if match else ''
    return row_data

with open(input_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', encoding='utf-8', newline='') as outfile:

    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=fields)
    writer.writeheader()

    for row in reader:
        raw_text = row.get('text', '')
        parsed = parse_text_block(raw_text)
        if parsed['TranslatedIngredients'] and parsed['TranslatedInstructions']:
            writer.writerow(parsed)

print(f"✅ Done! Parsed recipes saved to {output_file}")
