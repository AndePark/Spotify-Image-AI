import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUserPlaylists } from '../spotify';
import { catchErrors } from '../utils';
import { SectionWrapper, PlaylistsGrid, Loader } from '../components';


// The playlists will render twice because of React.StrictMode which causes the first useEffect to execute twice 
// By removing React.StrictMode in index.js, we don't get double rendering 
const Playlists = () => {
  const [playlistsData, setPlaylistsData] = useState(null);
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getCurrentUserPlaylists();
      setPlaylistsData(data);
      console.log(data);
      console.log('a');
    };

    catchErrors(fetchData());
  }, []);

  // When playlistsData updates, check if there are more playlists to fetch
  // then update the state variable
  useEffect(() => {
    if (!playlistsData) {
      return;
    }

    // Playlist endpoint only returns 20 playlists at a time, so we need to
    // make sure we get ALL playlists by fetching the next set of playlists
    const fetchMoreData = async () => {
      if (playlistsData.next) {
        const { data } = await axios.get(playlistsData.next);
        setPlaylistsData(data);
        // console.log(data);
      }
    };

    // Use functional update to update playlists state variable
    // to avoid including playlists as a dependency for this hook
    // and creating an infinite loop
    setPlaylists(playlists => ([
      ...playlists ? playlists : [],
      ...playlistsData.items
    ]));



    // Fetch next set of playlists as needed
    catchErrors(fetchMoreData());
  }, [playlistsData]);

  console.log(playlists);


  return (
    <main>
      <SectionWrapper title="Public Playlists" breadcrumb={true}>
        {playlists ? <PlaylistsGrid playlists={playlists} /> : <Loader />}
      </SectionWrapper>
    </main>
  );
};

export default Playlists;