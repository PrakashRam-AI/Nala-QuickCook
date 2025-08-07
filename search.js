async function searchRecipes() {
  const input = document.getElementById("ingredientInput").value
    .toLowerCase()
    .split(",")
    .map(i => i.trim());

  const selectedRegion = document.getElementById("regionSelect").value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const matches = recipes.filter(recipe =>
    input.some(ing => recipe.ingredients.some(rIng => rIng.includes(ing))) &&
    (selectedRegion === "" || recipe.region === selectedRegion)
  );

  const limitedMatches = matches.slice(0, 3); // Limit to 3 results

  if (limitedMatches.length === 0) {
    resultsDiv.innerHTML = "<p>No matching recipes found.</p>";
  } else {
    for (const recipe of limitedMatches) {
      const videoLink = await fetchYouTubeVideo(recipe.name);

      resultsDiv.innerHTML += `<div>
        <h3>${recipe.name}</h3>
        <img src="${recipe.image}" alt="${recipe.name}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;" />
        <p><strong>Time:</strong> ${recipe.cook_time}</p>
        <p><strong>Region:</strong> ${recipe.region}</p>
        <p><strong>Diet:</strong> ${recipe.diet}</p>
        ${videoLink
          ? `<p><a href="${videoLink}" target="_blank">🎥 Watch Recipe Video</a></p>`
          : `<p>No video available</p>`}
      </div><hr/>`;
    }
  }
}
