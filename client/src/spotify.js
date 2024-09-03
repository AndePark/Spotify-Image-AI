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

  
//  // this now works to change playlist cover image 
//  export const changeImage = async (imgData, playlistId) => {
//   try {
//     const response = await axios.put('https://api.spotify.com/v1/playlists/' + playlistId + '/images',
//       imgData
//       , {
//         headers: {
//           "Content-Type": 'image/jpeg',
//           Authorization: `Bearer ${LOCALSTORAGE_VALUES.accessToken}`,
//         },
//       }, 
//     );
//     console.log(response.status);
//     console.log(imgData);
//     return response; 
//   } catch (e) {
//     console.error(e.response ? e.response.data : e.message);
//   }
// };

export const changeImage = async (imgData, playlistId) => {
  const maxRetries = 3;
  const delay = 1000; // Initial delay in milliseconds

  const retryRequest = async (retries, delay) => {
    try {
      const response = await axios.put(`https://api.spotify.com/v1/playlists/${playlistId}/images`,
        imgData,
        {
          headers: {
            "Content-Type": 'image/jpeg',
            Authorization: `Bearer ${LOCALSTORAGE_VALUES.accessToken}`,
          },
        }
      );

      console.log('Success:', response.status);
      return response;
    } catch (e) {
      console.error('Error response data:', e.response ? e.response.data : e.message);
      if (retries === 0) throw e;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return retryRequest(retries - 1, delay * 2); // Exponential backoff
    }
  };

  return retryRequest(maxRetries, delay);
};



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




