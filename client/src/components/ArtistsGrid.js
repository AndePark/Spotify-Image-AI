import { StyledGrid } from '../styles';


// takes an artists prop and if artists exists and has a length then 
// map over the artists array and for each item in the artists array we 
// create a list item for it with the artist image, artist name and an Artist 
// label
const ArtistsGrid = ({artists}) => (
    <>
    {artists && artists.length ? (
      <StyledGrid type="artist">
        {artists.map((artist, i) => (
          <li className="grid__item" key={i}>
            <div className="grid__item__inner">
              {artist.images[0] && (
                <div className="grid__item__img">
                  <img src={artist.images[0].url} alt={artist.name} />
                </div>
              )}
              <h3 className="grid__item__name overflow-ellipsis">{artist.name}</h3>
              <p className="grid__item__label">Artist</p>
            </div>
          </li>
        ))}
      </StyledGrid>
    ) : (
      <p className="empty-notice">No artists available</p>
    )}
  </>
);

export default ArtistsGrid;