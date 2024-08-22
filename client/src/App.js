import { useState, useEffect } from 'react';
import { accessToken, logout, getCurrentUserProfile } from './spotify';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import './App.css';

function ScrollToTop() {
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null
}


function App() {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setToken(accessToken);
    
    const fetchData = async () => {
      try {
        const {data} = await getCurrentUserProfile();
        setProfile(data);
      } catch(e) {
        console.error(e);
      }
    };

    fetchData();
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        {!token ? (
          <a className="App-link" href="http://localhost:8888/login">
            Log in to Spotify
          </a>
        ) : (
          <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/top-artists" element={<h1>Top Artists</h1>} />
            <Route path="/top-tracks" element={<h1>Top Tracks</h1>} />
            <Route path="/playlists/:id" element={<h1>Playlist</h1>} />
            <Route path="/playlists" element={<h1>Playlists</h1>} />
            <Route path="/" element={
              <>
                <button onClick={logout}>Log Out</button>
                {profile && (
                  <div>
                    <h1>{profile.display_name}</h1>
                    <p>{profile.followers.total} Followers</p>
                    {profile.images.length && profile.images[0].url && (
                      <img src={profile.images[0].url} alt="Avatar"/>
                    )}
                  </div>
                )}
              </>
            } />
          </Routes>
        </Router>
      )}
    </header>
  </div>
  );
}

export default App;