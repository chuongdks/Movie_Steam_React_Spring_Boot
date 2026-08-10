import './App.css'
import api from './api/axiosConfig'
import { useState, useEffect } from 'react'
import Layout from './components/Layout.jsx'
import {Routes, Route} from 'react-router-dom'
import Home from './components/home/Home.jsx'
import Header from './components/header/Header.jsx'
import Trailer from './components/trailer/Trailer.jsx'
import Reviews from './components/reviews/Review.jsx'
import EntityReview from './components/reviews/EntityReview.jsx'
import NotFound from './components/notFound/NotFound.jsx'
import SteamLibrary from './components/steam/SteamLibrary.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import WatchList from './components/watchlist/WatchList.jsx'

function App() {

  const [movies, setMovies] = useState();
  const [movie, setMovie] = useState();
  const [reviews, setReviews] = useState([]);

  // Get Movies List with /api/v1/movies
  const getMovies = async () => { 
    try
    {
      const response = await api.get("/api/v1/movies");
      setMovies(response.data);
    } 
    catch(err)
    {
      console.log(err);
    }
  }
  
  // get specific movie info 
  const getMovieData = async (movieId) => {
    try 
    {
        const response = await api.get(`/api/v1/movies/${movieId}`);
        const singleMovie = response.data;
        console.log(singleMovie)

        setMovie(singleMovie);
        setReviews(singleMovie.reviewIds); // reviewIds vs reviews
    } 
    catch (error) 
    {
      console.error(error);
    }
  }

  useEffect(() => {
    getMovies();
  },[])

  return (
    <div className="App">
      <Header/>
      <Routes>
          <Route path="/" element={<Layout/>}>
            <Route path="/"                     element={<Home movies={movies} />} />
            <Route path="/Trailer/:ytTrailerId" element={<Trailer/>} />
            {/* Existing movie review route, kept for backwards compatibility. Use the new EntityReview below */}
            <Route path="/legacy-reviews/:movieId"     element ={<Reviews getMovieData={getMovieData} movie={movie} reviews={reviews} setReviews={setReviews} />} />
            <Route path="/reviews/:entityId"    element={<EntityReview />} />
            <Route path="/steam"                element={<SteamLibrary />} />
            <Route path="/dashboard"            element={<Dashboard />} />
            <Route path="/watchList"            element={<WatchList />} />
            <Route path="*"                     element = {<NotFound/>} />
          </Route>
      </Routes>

    </div>
  );
}


export default App
