export async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Client ID или Client Secret не определены");
    return null;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from Google OAuth:', errorData);
    
      if (errorData.error === "invalid_grant" && errorData.error_description === "Token has been revoked.") {
        console.error("Token has been revoked, clearing local data.");
        localStorage.clear();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response from Google OAuth:', data);
    
    if (data.access_token) {
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } else {
      console.error('Error updating token:', data);
      return null;
    }
  } catch (error) {
    console.error('Ошибка запроса refresh token:', error);
    return null;
  }
}