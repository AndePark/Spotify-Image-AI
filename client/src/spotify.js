import axios from 'axios';

// Map for localStorage keys
const LOCALSTORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
}

// Map to retrieve localStorage values
const LOCALSTORAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
}



  const imageData = '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';


  // this now works to change playlist cover image 
  export const changeImage = async (playlistId) => {
    const response = await axios.put('https://api.spotify.com/v1/playlists/' + playlistId + '/images',
      imageData
      , {
        headers: {
          "Content-Type": "image/jpeg",
          Authorization: `Bearer ${LOCALSTORAGE_VALUES.accessToken}`,
        },
      }
    );
    if (!response) {
      return false;
    }
    return response.data; 
  }


/**
 * clear all localStorage items and reload the page 
 */
export const logout = () => {
  // Clear all localStorage items
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }
  // Navigate to homepage
  window.location = window.location.origin;
};

/**
 * Use refreshToken in localStorage to hit /refresh_token endpoint in backend, then update values in 
 * localStorage with data from response
 */
const refreshToken = async () => {
  try {
    // Logout if there's no refresh token stored or we've managed to get into a reload infinite loop
    if (!LOCALSTORAGE_VALUES.refreshToken ||
      LOCALSTORAGE_VALUES.refreshToken === 'undefined' ||
      (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000
    ) {
      console.error('No refresh token available');
      logout();
    }

    // Use `/refresh_token` endpoint from backend  
    const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);

    // Update localStorage values
    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    // Reload the page for localStorage updates to be reflected
    window.location.reload();

  } catch (e) {
    console.error(e);
  }
};

/**
 * returns True if token has expired (elapsed time is greater than expiration time)
 * returns False if token has not expired or if accessToken or timeStamp is missing 
 */
const hasTokenExpired = () => {
  const {accessToken, timestamp, expireTime} = LOCALSTORAGE_VALUES;
  if (!accessToken || !timestamp) {
    return false; 
  }
  const milliSecElapsed = Date.now() - Number(timestamp); 
  return (milliSecElapsed / 1000) > Number(expireTime);
}; 


/**
 * 
 * handles logic for retrieving access token from localStorage or URL query params
 */
const getAccessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };

  // we pass an error query param from callback handler 
  const hasError = urlParams.get('error');

  // If there's an error OR the token in localStorage has expired OR the token in localStorage exists but is undefined , refresh the token
  if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
    refreshToken();
  }

  // If there is a valid access token in localStorage, use that
  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
    return LOCALSTORAGE_VALUES.accessToken;
  }

  // If there is a token in the URL query params, user is logging in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    // Store the query params in localStorage
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }
    // Set timestamp
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    // Return access token from query params
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  // We should never get here!
  return false;
};
  
  export const accessToken = getAccessToken();



/**
 * Axios global request headers
 * https://github.com/axios/axios#global-axios-defaults
 */
axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
axios.defaults.headers['Content-Type'] = 'application/json';


  /**
 * get current user's profile
 */
  export const getCurrentUserProfile = () => axios.get('/me');

  // https://api.spotify.com/v1/me/playlists
  export const getCurrentUserPlaylists = (limit = 20) => { 
    return axios.get(`/me/playlists?limit=${limit}`);
  };

  //https://api.spotify.com/v1/me/top/{type}
  export const getTopArtists = (time_range = 'short_term') => {
    return axios.get(`/me/top/artists?time_range=${time_range}`);
  };

  //https://api.spotify.com/v1/me/top/{type}
  export const getTopTracks = (time_range = 'short_term') => {
    return axios.get(`/me/top/tracks?time_range=${time_range}`);
  };

  //https://api.spotify.com/v1/playlists/{playlist_id}
  export const getPlaylistById = (playlist_id) => {
    return axios.get(`/playlists/${playlist_id}`);
  };



  //https://api.spotify.com/v1/audio-features
  //ids is a comma-separated list of the Spotify IDs for the tracks 
  export const getAudioFeaturesForTracks = (ids) => {
    return axios.get(`/audio-features?ids=${ids}`);
  };




