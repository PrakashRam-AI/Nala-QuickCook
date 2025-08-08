async function fetchYouTubeVideo(recipeName) {
  const apiKey = "AIzaSyDt9MlePDg0HXXi4gvnhLODXLiHycpd4mc"; // replace with your actual key
  const query = `${recipeName} recipe`;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&key=${apiKey}&maxResults=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error("YouTube API error:", err);
    return null;
  }
}
