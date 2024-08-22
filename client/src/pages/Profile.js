import { useState, useEffect } from 'react';
import { getCurrentUserProfile, getCurrentUserPlaylists, getTopArtists, getTopTracks} from '../spotify';
import {SectionWrapper, ArtistsGrid, TrackList, PlaylistsGrid} from '../components';
import { StyledHeader } from '../styles';




const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [topArtists, setTopArtists] = useState(null);
  const [topTracks, setTopTracks] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // gets user's account info
        const profileData = await getCurrentUserProfile();
        setProfile(profileData.data);

        // gets user's playlists
        // playlistsData.data.items[0].id gives us the playlist ID for the first playlist in the array of playlists returned
        const playlistsData = await getCurrentUserPlaylists();
        setPlaylists(playlistsData.data);
    
        //gets user's top artists 
        // each object in the items array should be data for an artist  
        const topArtistsData = await getTopArtists();
        setTopArtists(topArtistsData.data); 

        //gets user's top tracks 
        const topTracksData = await getTopTracks();
        setTopTracks(topTracksData.data);

      } catch(e) {
        console.error(e);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {profile && (
        <>
       <StyledHeader type="user">
        <div className="header__inner">
              {profile.images.length && profile.images[0].url && (
                <img className="header__img" src={profile.images[0].url} alt="Avatar"/>
              )}
              <div>
                <div className="header__overline">Profile</div>
                <h1 className="header__name">{profile.display_name}</h1>
                <p className="header__meta">
                  {playlists && (
                    <span>{playlists.total} Playlist{playlists.total !== 1 ? 's' : ''}</span>
                  )}
                  <span>
                    {profile.followers.total} Follower{profile.followers.total !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
            </div>
       </StyledHeader>
      
        
            <main>
            {topArtists && topTracks && playlists && (
              <>
               <SectionWrapper title="Top artists this month" seeAllLink="/top-artists">
                <ArtistsGrid artists={topArtists.items.slice(0, 10)} />
              </SectionWrapper>
              
              <SectionWrapper title="Top tracks this month" seeAllLink="/top-tracks">
                <TrackList tracks={topTracks.items.slice(0, 10)} />
              </SectionWrapper>

              <SectionWrapper title="Playlists" seeAllLink="/playlists">
                <PlaylistsGrid playlists={playlists.items.slice(0, 10)} />
              </SectionWrapper>
              </>
               )}
            </main>
         
        </>
  )}
  </>
  )
};

// notice how SectionWrapper wraps around the new sections  

export default Profile;