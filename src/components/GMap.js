import { Button, Collapse, Container, Grid, Link, StyledButtonGroup, Text } from "@nextui-org/react";
import { useRef, useEffect, useState } from "react";
import ROSLIB from 'roslib'
import GoogleMapReact from 'google-map-react'
import RosConnection from "./ros_connection";
const APIKEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;



const K_WIDTH = 0;
const K_HEIGHT = 0;

const MarkerStyle = {
    // initially any map object has left top corner at lat lng coordinates
    // it's on you to set object origin to 0,0 coordinates
    position: 'absolute',
    width: K_WIDTH,
    height: K_HEIGHT,
    borderLeft: "4px solid transparent",
    borderRight: "4px solid transparent",
    borderTop: "8px solid #555",
};





const Marker = ({ text }) => <div style={MarkerStyle}>{text}</div>;


function GoogleMap({ apiKey, center, zoom, handleMapClick, points, handleApiLoaded }) {


    return <GoogleMapReact
        onGoogleApiLoaded={handleApiLoaded}
        onClick={handleMapClick}
        bootstrapURLKeys={{ key: apiKey }}
        center={center}
        defaultZoom={zoom}
        yesIWantToUseGoogleMapApiInternals
    //    onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
    >
        <Marker lat={center.lat} lng={center.lng} text={"c"} />
        {points.map((point, index) => (
            <Marker lat={point.lat} lng={point.lng} text={index + 1} key={index} />))}
    </GoogleMapReact>
}



function GMap() {

    const [points, setPoints] = useState([]);
    const [center, setCenter] = useState({ lat: 37.54, lng: -80.39 });
    const [isCollectingPoints, setIsCollectingPoints] = useState(false);

    const [waypoints, setWaypoints] = useState([]);
    const [robotPose, setRobotPose] = useState(null);
    const mapRef = useRef();
    const rosRef = useRef();
    const handleMapClick = (event) => {
        // console.log(event)
        if (isCollectingPoints) {
            const { lat, lng } = event;
            // console.log(lat)
            const newPoints = [...points, { lat, lng }];
            setPoints(newPoints);
        }
    };


    const actionUndo = () => {
        if (points.length > 0) {
            const newPoints = [...points];
            newPoints.pop();
            setPoints(newPoints);
        }
    }

    const actionFinishAndSave = () => {
        if (points.length === 0)
            return;

        setIsCollectingPoints(false);
        setWaypoints([...waypoints, points]);
        setPoints([]);
        setIsCollectingPoints(false);
    }

    const actionCreateNewWaypoint = () => {
        setIsCollectingPoints(true);
        setPoints([]);
    }
    const asSeenOnMap = useRef([]);
    const actionSeeOnMap = (index) => {

        if (asSeenOnMap.current.length > 0) {
            asSeenOnMap.current.map((item) => item.setMap(null))
            asSeenOnMap.current = [];
        }

        const waypoint = waypoints[index];
        const { map, maps } = mapRef.current;
        // console.log(maps)
        const lines = new maps.Polyline({
            path: waypoint,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 1,
        });

        waypoint.map((point, index) => {
            var marker = new maps.Marker({
                position: point,
            })
            marker.setMap(map)
            asSeenOnMap.current.push(marker)
        })

        lines.setMap(map)
        asSeenOnMap.current.push(lines)
    }

    function getListener(ros) {
        var ne = new ROSLIB.Topic({
            ros: ros,
            name: '/gps/filtered',
            messageType: 'sensor_msgs/NavSatFix'
        });
        return ne;
    }


    const handleApiLoaded = (map) => {
        mapRef.current = map;
        var { map, maps } = mapRef.current;
        const ros = rosRef.current;
        // console.log(ros)
        if (ros) {
            const centerListener = getListener(ros)

            centerListener.subscribe(function (message) {
                console.log(message.latitude);
                setCenter({ lat: message.latitude, lng: message.longitude })
                centerListener.unsubscribe();
            });


        }
    }

    const trackRobot = () => {
        // mapRef.current = map;
        var { map, maps } = mapRef.current;
        const ros = rosRef.current;
        // console.log(ros)
        if (ros) {
            const listener = getListener(ros)

            listener.subscribe(function (message) {
                console.log(message);
                setRobotPose({ lat: message.latitude, lng: message.longitude })
                console.log(robotPose)
                listener.unsubscribe();
                var cityCircle = new maps.Circle({
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    center: robotPose,
                    radius: 1,
                });
                cityCircle.setMap(map);
            });
        }
    }

    const clearMap = () => {
        asSeenOnMap.current.map((item) => item.setMap(null))
        asSeenOnMap.current = [];
    }


    return <Container>
        <Grid.Container>
            <Grid xs={3}>
                <div>
                    <div>
                        <Text h1>Controls</Text>
                        <RosConnection ref={rosRef} />
                    </div>
                    <div>
                        <Text h3>Actions</Text>
                        <hr />
                    </div>
                    <div>
                        <Button onPress={actionCreateNewWaypoint}>Create new waypoint</Button>
                        <div>
                            <Button onPress={actionUndo}>Undo</Button>
                            <Button onPress={actionFinishAndSave}>Finish and Save</Button>
                            <Button onPress={trackRobot}>Track Robot</Button>
                        </div>
                    </div>
                    <div>
                        <Text h1>Waypoints</Text>
                        <Grid>
                            {waypoints.map((waypoint, index) => (
                                <Collapse title={`Waypoint ${index + 1}`} key={index} subtitle={<Text>{waypoint.length} points. <Link onClick={(evt) => { evt.preventDefault(); actionSeeOnMap(index) }} href="#">See on map </Link></Text>}><Text>{JSON.stringify(waypoint)}</Text></Collapse>

                            ))}
                        </Grid>
                    </div>
                    {asSeenOnMap.current.length > 0 && <Button onPress={clearMap}>Clear Map</Button>}
                </div>


            </Grid>
            <Grid xs={9} css={{ height: "100vh" }}>
                <GoogleMap handleApiLoaded={handleApiLoaded} points={points} handleMapClick={handleMapClick} apiKey={APIKEY} center={center} zoom={16} />
            </Grid>
        </Grid.Container>
    </Container >
}





export default GMap;