from datasets import load_dataset

# Use a compatible dataset with recipe details
dataset = load_dataset("chiyunz/IndianFoodRecipes", split="train")

# Save to TSV format
dataset.to_csv("indian_recipes.csv", sep="\t", index=False)

print("✅ Download complete! Saved as indian_recipes.csv")
