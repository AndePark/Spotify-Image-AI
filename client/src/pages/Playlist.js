import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { catchErrors} from '../utils'
import { getPlaylistById, getAudioFeaturesForTracks } from '../spotify';
import { StyledHeader, StyledDropdown} from '../styles';
import { TrackList, SectionWrapper, Loader} from '../components';
import ImageDisplay from './ImageDisplay';
import { ThreeDots } from 'react-loader-spinner';
import axios from 'axios';


// useParams hook to get the id param from the URL 
// which can be used as the id for a specific playlist 
const Playlist = () => {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [tracksData, setTracksData] = useState(null);
    const [tracks, setTracks] = useState(null);
    const [audioFeatures, setAudioFeatures] = useState(null);
    const [sortValue, setSortValue] = useState('');
    const sortOptions = ['danceability', 'tempo', 'energy'];
    const [base64Image, setBase64Image] = useState(null);
    const [playlistImage, setPlaylistImage] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // id is a dependency for this useEffect hook because we need it to call the getPlaylistById function 
    // we are storing the playlist object as well as the tracks property from the playlist object so that 
    // we can get all the tracks, not just the limit (which is 100)
  useEffect(() => {
    const fetchData = async () => {
        const { data } = await getPlaylistById(id);
        setPlaylist(data);
        setTracksData(data.tracks);
        setPlaylistImage(data.images[0].url);
    };

    catchErrors(fetchData()); 
    }, [id]);

  // Function to handle image change
  const handleImageChange = async () => {
    const { data } = await getPlaylistById(id);
    setPlaylistImage(data.images[0].url);
  };


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

    // maps through each track object, returning the track property on it 
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


  const generateImage = async () => {
    setIsGenerating(true);
    try { 
      const requestData = {
        danceability: averageMetrics.danceability.toFixed(3),
        energy: averageMetrics.energy.toFixed(3),
        tempo: averageMetrics.tempo.toFixed(3),
      };

      console.log('calling');

      const response = await fetch("http://localhost:8888/openai/generateImage", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('fetched');

      const data = await response.json();
      const baseImage = data.imageBase64;
      // console.log(data.imageBase64);
      // console.log(baseImage);
      setBase64Image(`data:image/png;base64,${baseImage}`); 
    } catch(error) {
      console.error('Error generating image:', error.message);
    }
    setIsGenerating(false);
    // console.log(playlist);
  };
    
    
  return (
    <>
      {playlist ? (
        <>
          <StyledHeader>
          <div className="header__inner">
            {playlistImage && (
                  <img
                    className="header__img"
                    src={playlistImage}
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
              <button onClick={generateImage}>Generate New Playlist Cover Image</button>
                {isGenerating ? (
                <div className="loader-wrapper">
                  <ThreeDots 
                    height="80" 
                    width="80" 
                    radius="9"
                    color="#4fa94d" 
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClassName=""
                    visible={true}
                  />
                </div> 
                ) : (base64Image && <ImageDisplay base64Image={base64Image} id={id} onImageChange={handleImageChange}/>)}
                {/* {base64Image && (<ImageDisplay base64Image={base64Image} id={id} onImageChange={handleImageChange}/>)} */}
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