import { useParams } from "react-router-dom";
import ReactPlayer from 'react-player'
import './Trailer.css'

const Trailer = () => {

    // let params = useParams();
    // let key = params.ytTrailerId;
    const {ytTrailerId} = useParams()

  return (
    <div className="react-player-container">
        {({ytTrailerId} != null) ? 
            <ReactPlayer 
                controls="true" 
                playing={true} 
                url ={`https://www.youtube.com/watch?v=${ytTrailerId}`} 
                width = '100%' height='100%' 
            />
        : null}
    </div>
  )
}

export default Trailer
