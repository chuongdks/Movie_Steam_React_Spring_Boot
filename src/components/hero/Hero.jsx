import './Hero.css'
import Carousel from 'react-material-ui-carousel'
import { Paper } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faBookmark } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import { useAuth } from '../../context/AuthContext';
import { useWatchlist } from '../../context/WatchlistContext';

const Hero = ({movies}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addItem, removeItem, isInWatchlist } = useWatchlist();

    const handleWatchlist = async (movie) => {
        if (!user) {
            // Nudge user to log in, could also open the AuthModal here
            navigate('/');
            return;
        }
        const entityId = movie.imdbId;

        if (isInWatchlist(entityId)) {
            await removeItem(entityId);
        } else {
            await addItem({
                entityId,
                entityType: 'MOVIE',
                title:      movie.title,
                posterUrl:  movie.poster,
                status:     'TO_WATCH'
            });
        }
    };
        
  return (
    <div className ='movie-carousel-container'>
      <Carousel>
        {
            movies?.map((movie) => {
                const inList = isInWatchlist(movie.imdbId); // check if movie is in the list (watch list)
                return(
                    <Paper key={movie.imdbId}>
                        <div className = 'movie-card-container'>
                            <div className="movie-card" style={{"--img": `url(${movie.backdrops[0]})`}}>
                                <div className="movie-detail">
                                    <div className="movie-poster">
                                        <img src={movie.poster} alt="" />
                                    </div>
                                    <div className="movie-title">
                                        <h4>{movie.title}</h4>
                                    </div>
                                    <div className="movie-buttons-container">
                                        <Link to={`/Trailer/${movie.trailerLink.substring(movie.trailerLink.length - 11)}`}>
                                            <div className="play-button-icon-container">
                                                <FontAwesomeIcon className="play-button-icon"
                                                    icon = {faCirclePlay}
                                                />
                                            </div>
                                        </Link>

                                        <div className="movie-review-button-container">
                                            <Button variant ="info" onClick={() => navigate(`/Reviews/${movie.imdbId}`)}>
                                                Reviews
                                            </Button>

                                            {/* Watchlist toggle — only shown to logged-in users */}
                                            {user && (
                                                <Button
                                                    variant={inList ? "warning" : "outline-warning"}
                                                    size="sm"
                                                    onClick={() => handleWatchlist(movie)}
                                                    title={inList ? "Remove from Watchlist" : "Add to Watchlist"}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={inList ? faBookmark : faBookmarkOutline}
                                                        className="me-1"
                                                    />
                                                    {inList ? 'Saved' : 'Watchlist'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Paper>
                )
            })
        }
      </Carousel>
    </div>
  )
}

export default Hero