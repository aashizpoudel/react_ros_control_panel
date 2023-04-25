import { Button, Grid } from "@nextui-org/react";
import { useRef, useEffect,useState } from "react";
import GoogleMapReact from 'google-map-react'
const APIKEY= process.env.REACT_APP_GOOGLE_MAP_API_KEY;

function GoogleMap({ apiKey, center, zoom }) {
    const [points, setPoints] = useState([]);
    const [isCollectingPoints, setIsCollectingPoints] = useState(true);

    const handleClick = () =>{
        setIsCollectingPoints(true);
        setPoints([]);
    
    }
    const handleMapClick = (event) => {
        if (isCollectingPoints) {
        const {lat, lng} = event;
        console.log(lat)
          const newPoints = [...points, { lat, lng }];
          setPoints(newPoints);
        }
      };

   return <GoogleMapReact
   onClick={handleMapClick}
   bootstrapURLKeys={{ key: apiKey }}
   defaultCenter={center}
   defaultZoom={zoom}
//    yesIWantToUseGoogleMapApiInternals
//    onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
 >
    {points.map((point, index) => ( 
        <div key={index}>
            </div>))}
 </GoogleMapReact>
  }

  

function GMap(){
    return <div>
        <Grid.Container>
            <Grid xs={3}>
                <div><h2>Mission control</h2>
                <hr/>
                <Button>Create new waypoints</Button>
                </div>
                
            </Grid>
            <Grid xs={9} css={{height: "100vh"}}>
               <GoogleMap  apiKey={APIKEY} center={{lat: 37.24, lng: -80.39}} zoom={16}/>
            </Grid>
        </Grid.Container>
    </div>
}



export default GMap;