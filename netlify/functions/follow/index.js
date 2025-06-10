const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const code = event.queryStringParameters.code;
  if (!code) {
    return {
      statusCode: 400,
      body: "Missing Spotify code",
    };
  }

  const clientId = "1b8f90b476ed4de8aac2145eb8c8337a";
  const clientSecret = "940534a038f54f60a2d388478f7bf26c";
  const redirectUri = "https://djpops-spotify-follow.netlify.app/.netlify/functions/follow";
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return {
        statusCode: 500,
        body: "Failed to get access token",
      };
    }

    await fetch("https://api.spotify.com/v1/me/following?type=artist", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: ["1AoKgbyBZ044CzutkCagzs"] }),
    });

    return {
      statusCode: 302,
      headers: {
        Location: "https://open.spotify.com/artist/1AoKgbyBZ044CzutkCagzs",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error: ${error.message}`,
    };
  }
};
