const CLIENT_ID = "21d825c243f140b496fd6652cd4f2f6a";
const REDIRECT_URI = "https://spotify-react-app-pe82.vercel.app/callback";
const SCOPES =
  "user-read-private user-read-email user-read-playback-state user-modify-playback-state streaming";

function generateCodeVerifier() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function loginWithSpotify() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("code_verifier", verifier);
  console.log("verifier saved:", localStorage.getItem("code_verifier"));

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function fetchToken() {
  const code = new URLSearchParams(window.location.search).get("code");
  const verifier = localStorage.getItem("code_verifier");

  console.log('code:', code)
  console.log('verifier:', verifier)
  console.log('all localStorage keys:', Object.keys(localStorage))

  if (!code || !verifier) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  const data = await response.json();

  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("refresh_token", data.refresh_token);
  sessionStorage.setItem("expires_at", Date.now() + data.expires_in * 1000);

  return data.access_token;
}

async function refreshToken() {
  const storedRefreshToken = sessionStorage.getItem("refresh_token");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: storedRefreshToken,
    }),
  });

  const data = await response.json();

  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("expires_at", Date.now() + data.expires_in * 1000);

  if (data.refresh_token) {
    sessionStorage.setItem("refresh_token", data.refresh_token);
  }

  return data.access_token;
}

export async function getToken() {
  const token = sessionStorage.getItem("access_token");
  const expiresAt = sessionStorage.getItem("expires_at");

  if (!token) {
    await loginWithSpotify();
    return null;
  }

  if (Date.now() < expiresAt - 60000) {
    return token;
  }

  return await refreshToken();
}

