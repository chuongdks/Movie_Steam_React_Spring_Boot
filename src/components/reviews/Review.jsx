import { useEffect, useRef } from "react";
import api from '../../api/axiosConfig.js';
import {useParams} from 'react-router-dom';
import {Container, Row, Col} from 'react-bootstrap';
import ReviewForm from '../reviewForm/ReviewForm.jsx';

import React from 'react'

const Reviews = ({getMovieData,movie,reviews,setReviews}) => {

    const revText = useRef();
    let params = useParams();
    const movieId = params.movieId;

    useEffect(()=>{
        getMovieData(movieId);
    },[])

    const addReview = async (e) => {
        e.preventDefault();
        const rev = revText.current;

        try
        {
            const response = await api.post("/api/v1/reviews", {reviewBody:rev.value,imdbId:movieId});  // key needs to be reviewBody and imdbId according to back-end
            const updatedReviews = [...reviews, {body:rev.value}];  // remove ...reviews works if the App.jsx fucked up
            setReviews(updatedReviews);

            rev.value = "";
        }
        catch(err)
        {
            console.error(err);
        }
    }

  return (
    <Container>
        <Row>
            <Col><h3>Reviews</h3></Col>
        </Row>
        <Row className="mt-2">
            <Col>
                <img src={movie?.poster} alt="" />
            </Col>
            <Col>
                {
                    <>
                        <Row>
                            <Col>
                                <ReviewForm handleSubmit={addReview} revText={revText} labelText = "Write a Review?" />  
                                <hr />
                            </Col>
                        </Row>
                    </>
                }
                {   
                    // use movie.reviewIds.map
                    reviews?.map((review) => {
                        return(
                            <>
                                <Row>
                                    <Col>{review.body}</Col>
                                    <hr />
                                </Row>                             
                            </>
                        )
                    })
                }
            </Col>
        </Row>
        <Row>
            <Col>
                <hr />
            </Col>
        </Row>        
    </Container>
  )
}

export default Reviews
