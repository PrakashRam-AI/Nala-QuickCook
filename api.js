// -- MealDB API Endpoint --
const MEALDB_SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/filter.php?i=";
const MEALDB_DETAIL_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

// -- Search recipes by ingredient --
async function getRecipesByIngredient(ingredient) {
  try {
    const response = await fetch(`${MEALDB_SEARCH_URL}${encodeURIComponent(ingredient)}`);
    const data = await response.json();

    if (data.meals) {
      // Fetch detailed info for each meal (name, instructions, etc.)
      const detailedRecipes = await Promise.all(
        data.meals.map(async (meal) => {
          const detailRes = await fetch(`${MEALDB_DETAIL_URL}${meal.idMeal}`);
          const detailData = await detailRes.json();
          return detailData.meals[0]; // Single recipe object
        })
      );
      return detailedRecipes;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching from TheMealDB:", error);
    return [];
  }
}

// -- YouTube API Key --
const YOUTUBE_API_KEY = "REPLACE_WITH_YOUR_ACTUAL_API_KEY";

// -- YouTube Search Function --
async function fetchYouTubeVideo(recipeName) {
  const query = `${recipeName} recipe`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${AIzaSyDt9MlePDg0HXXi4gvnhLODXLiHycpd4mc}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    } else {
      return null;
    }
  } catch (error) {
    console.error("YouTube API error:", error);
    return null;
  }
}
