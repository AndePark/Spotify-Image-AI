import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { catchErrors } from '../utils'
import { getPlaylistById, getAudioFeaturesForTracks, changeDetails, changeImage } from '../spotify';
import { StyledHeader, StyledDropdown} from '../styles';
import { TrackList, SectionWrapper, Loader} from '../components';
import axios from 'axios';


// useParams hook to get the id param from the URL 
// then we pass that id to getPlaylistById function 
const Playlist = () => {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [tracksData, setTracksData] = useState(null);
    const [tracks, setTracks] = useState(null);
    const [audioFeatures, setAudioFeatures] = useState(null);
    const [sortValue, setSortValue] = useState('');
    const sortOptions = ['danceability', 'tempo', 'energy'];
    

    // id is a dependency for this useEffect hook because we need it to call the getPlaylistById function 
    // we are storing the playlist object as well as the tracks property from the playlist object so that 
    // we can get all the tracks, not just the limit (which is 100)
    useEffect(() => {
    const fetchData = async () => {
        const { data } = await getPlaylistById(id);
        setPlaylist(data);
        setTracksData(data.tracks);
        const result = await changeDetails(id);
        console.log(result);
        const response = await changeImage(id);
        console.log(response);
    };

    catchErrors(fetchData()); 
    }, [id]);

    // console.log(playlist);
    // When tracksData updates, compile arrays of tracks and audioFeatures
    useEffect(() => {
        if(!tracksData) {
            return;
        }

        // When tracksData updates, check if there are more tracks to fetch
        // then update the state variable
        const fetchMoreData = async () => {
            if (tracksData.next) {
              const { data } = await axios.get(tracksData.next);
              setTracksData(data);
            }
          };
      
          // we compile an array of all the tracks on a playlist
          setTracks(tracks => ([
            ...tracks ? tracks : [],
            ...tracksData.items
          ]));
      
          catchErrors(fetchMoreData());

          // Also update the audioFeatures state variable using the track IDs
        const fetchAudioFeatures = async () => {
            const ids = tracksData.items.map(({ track }) => track.id).join(',');
            const { data } = await getAudioFeaturesForTracks(ids);
            setAudioFeatures(audioFeatures => ([
                ...audioFeatures ? audioFeatures : [],
                ...data['audio_features']
            ]));
         };

      catchErrors(fetchAudioFeatures());

    }, [tracksData]);

    // maps through each track object and returning the track property on it 
   // Map over tracks and add audio_features property to each track
   const tracksWithAudioFeatures = useMemo(() => {
    if (!tracks || !audioFeatures) {
      return null;
    }

    // map over the tracks array, finding the corresponding audio features object from the audioFeatures array 
    // using the track's id and assigning it to the track's audio_features property 
    // each track object is extracted and a copy (trackToAdd) is made which ensures the original track object isn't modified
    return tracks.map(({ track }) => {
      const trackToAdd = track;

      //.find() searches through audioFeatures array looking for the first object where 
      // item.id matches track.id 
      if (!track.audio_features) {
        const audioFeaturesObj = audioFeatures.find(item => {
          if (!item || !track) {
            return null;
          }
          return item.id === track.id;
        });

        trackToAdd['audio_features'] = audioFeaturesObj;
      }

      return trackToAdd;
    });
  }, [tracks, audioFeatures]);

   // Sort tracks by audio feature to be used in template
   const sortedTracks = useMemo(() => {
    if (!tracksWithAudioFeatures) {
      return null;
    }

    return [...tracksWithAudioFeatures].sort((a, b) => {
      const aFeatures = a['audio_features'];
      const bFeatures = b['audio_features'];

      if (!aFeatures || !bFeatures) {
        return false;
      }

      return bFeatures[sortValue] - aFeatures[sortValue];
    });
  }, [sortValue, tracksWithAudioFeatures]);


  const averageMetrics = useMemo(() => {
    if (!audioFeatures || audioFeatures.length === 0) {
      return {
        danceability: 0,
        energy: 0,
        tempo: 0,
      };
    }
  
    const totalMetrics = audioFeatures.reduce(
      (acc, feature) => {
        if (feature) {
          acc.danceability += feature.danceability;
          acc.energy += feature.energy;
          acc.tempo += feature.tempo;
        }
        return acc;
      },
      { danceability: 0, energy: 0, tempo: 0 }
    );
  
    const count = audioFeatures.length;
  
    return {
      danceability: totalMetrics.danceability / count,
      energy: totalMetrics.energy / count,
      tempo: totalMetrics.tempo / count,
    };
  }, [audioFeatures]);

  

  return (
    <>
      {playlist ? (
        <>
          <StyledHeader>
            
            <div className="header__inner">
              {playlist.images.length && playlist.images[0].url && (
                <img
                  className="header__img"
                  src={playlist.images[0].url}
                  alt="Playlist Artwork"
                />
              )}
              <div>
                <div className="header__overline">Playlist</div>
                <h1 className="header__name">{playlist.name}</h1>
                <p className="header__meta">
                  {playlist.followers.total ? (
                    <span>
                      {playlist.followers.total}{" "}
                      {`follower${playlist.followers.total !== 1 ? "s" : ""}`}
                    </span>
                  ) : null}
                  <span>
                    {playlist.tracks.total}{" "}
                    {`song${playlist.tracks.total !== 1 ? "s" : ""}`}
                  </span>
                </p>
              </div>
            </div>
          </StyledHeader>

          <main>
            <SectionWrapper title="Playlist" breadcrumb={true}>
              <StyledDropdown active={!!sortValue}>
                <label className="sr-only" htmlFor="order-select">
                  Sort tracks
                </label>
                <select
                  name="track-order"
                  id="order-select"
                  onChange={(e) => setSortValue(e.target.value)}
                >
                  <option value="">Sort tracks</option>
                  {sortOptions.map((option, i) => (
                    <option value={option} key={i}>
                      {`${option.charAt(0).toUpperCase()}${option.slice(1)}`}
                    </option>
                  ))}
                </select>
              </StyledDropdown>
                <p>Average Danceability: {averageMetrics.danceability.toFixed(3)}</p>
                <p>Average Energy: {averageMetrics.energy.toFixed(3)}</p>
                <p>Average Tempo: {averageMetrics.tempo.toFixed(3)}</p>
              {sortedTracks && <TrackList tracks={sortedTracks} />}
            </SectionWrapper>
          </main>
        </>
      ) : (
        <Loader />
      )}
    </>
  );

  
};

export default Playlist;