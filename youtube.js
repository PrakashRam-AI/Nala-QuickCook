const YOUTUBE_API_KEY = "AIzaSyDt9MlePDg0HXXi4gvnhLODXLiHycpd4mc"; // Replace with your actual API key

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
