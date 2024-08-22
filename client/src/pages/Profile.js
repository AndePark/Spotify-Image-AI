import { useState, useEffect } from 'react';
import { getCurrentUserProfile, getCurrentUserPlaylists} from '../spotify';
import { StyledHeader } from '../styles';


const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getCurrentUserProfile();
        setProfile(profileData.data);

        const playlistsData = await getCurrentUserPlaylists();
        setPlaylists(playlistsData.data);

        // firstPlaylist is the ID of the first playlist 
        const firstPlaylist = playlistsData.data.items[0].id;
        console.log(firstPlaylist);
        // console.log('First Playlist Tracks:', firstPlaylist.tracks);
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
       </>
      )}
    </>
  )
};

export default Profile;