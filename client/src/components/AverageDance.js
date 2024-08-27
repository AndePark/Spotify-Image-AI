import { StyledTrackList } from '../styles';

const AverageDance = ({audioFeatures}) => (
    <>
    {audioFeatures && audioFeatures.length ? (
      <StyledTrackList>
        {audioFeatures.map((feature, i) => (
          <li className="track__item" key={i}>
            <div className="track__item__num">{i + 1}</div>
            <div className="track__item__album overflow-ellipsis">
                {feature.danceability}
              </div>
            </li>
          ))}
        </StyledTrackList>
      ) : (
        <p className="empty-notice">No tracks available</p>
      )}
    </>
  );

export default AverageDance;