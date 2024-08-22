import { Link } from 'react-router-dom';
import { StyledGrid } from '../styles';

// uses StyledGrid styled component like ArtistsGrid, but difference is PlaylistsGrid component doesn't 
// pass a type prop thus playlist images are not displayed as circles (look at StyledGrid grid__item__img)

// Link component used to wrap each playlist item to a link which is to its individual playlist page
const PlaylistsGrid = ({ playlists }) => (
    <>
      {playlists && playlists.length ? (
        <StyledGrid>
          {playlists.map((playlist, i) => (
            <li className="grid__item" key={i}>
              <Link className="grid__item__inner" to={`/playlists/${playlist.id}`}>
                {playlist.images.length && playlist.images[0] && (
                  <div className="grid__item__img">
                    <img src={playlist.images[0].url} alt={playlist.name} />
                  </div>
                )}
                <h3 className="grid__item__name overflow-ellipsis">{playlist.name}</h3>
                <p className="grid__item__label">Playlist</p>
              </Link>
            </li>
          ))}
        </StyledGrid>
      ) : (
        <p className="empty-notice">No playlists available</p>
      )}
    </>
  );
  
  export default PlaylistsGrid;