const GRAPHQL_ENDPOINT = "https://indian-food-recipe-api.vercel.app/api/graphql";

async function getRecipesByIngredient(ingredient) {
  const query = `
    query {
      recipes(name: "${ingredient}") {
        name
        ingredients
        instructions
        image
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    return data.data.recipes || [];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}
// -- YouTube API Key --
const YOUTUBE_API_KEY = "AIzaSyDt9MlePDg0HXXi4gvnhLODXLiHycpd4mc";

// -- YouTube Search Function --
async function fetchYouTubeVideo(recipeName) {
  const query = `${recipeName} recipe`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;

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
