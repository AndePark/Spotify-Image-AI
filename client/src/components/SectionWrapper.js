import { Link } from 'react-router-dom';
import { StyledSection } from '../styles';

// SectionWrapper component wraps around ArtistsGrid component and every time 
// we have a new section to ensure consistency in HTML structure and style (ie. padding etc)
const SectionWrapper = ({ children, title, seeAllLink, breadcrumb }) => (
  <StyledSection>
    <div className="section__inner">
      <div className="section__top">
        <h2 className="section__heading">
          {breadcrumb && (
            <span className="section__breadcrumb">
              <Link to="/">Profile</Link>
            </span>
          )}
          {title && (
            <>
              {seeAllLink ? (
                <Link to={seeAllLink}>{title}</Link>
              ) : (
                <span>{title}</span>
              )}
            </>
          )}
        </h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="section__see-all">See All</Link>
        )}
      </div>

      {children}
    </div>
  </StyledSection>
);

export default SectionWrapper;