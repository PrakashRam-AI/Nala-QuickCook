from datasets import load_dataset
import pandas as pd

# Load dataset from Hugging Face
ds = load_dataset("nf-analyst/indian_recipe_dataset")

# Convert to Pandas DataFrame
df = ds["train"].to_pandas()

# Save as CSV
df.to_csv("recipes.csv", index=False)

print("✅ recipes.csv downloaded successfully.")
