import { Button, Collapse, Container, Grid, Link, StyledButtonGroup, Text } from "@nextui-org/react";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import ROSLIB from 'roslib'
import RosConnection from "./ros_connection";
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Layer, Marker, NavigationControl, Source } from 'react-map-gl';



// const APIKEY = process.env.REACT_APP_MAPBOX_API_KEY;


// mapboxgl.accessToken = APIKEY;





function GMap() {

    const [points, setPoints] = useState([]);
    const center = { latitude: 37.227857, longitude: -80.4193 };
    const [isCollectingPoints, setIsCollectingPoints] = useState(false);
    const [selectedWaypoint, setSelectedWaypoint] = useState([]);
    const [waypoints, setWaypoints] = useState([]);
    const [robotPose, setRobotPose] = useState();
    const [robotPoseHistory, setRobotPoseHistory] = useState([]);
    const [trackingRobot, setTrackingRobot] = useState(false);
    const [robotPoseHistoryData, setRobotPoseHistoryData] = useState({});
    const mapRef = useRef();
    const rosRef = useRef();
    const handleMapClick = (event) => {
        // console.log(event)
        if (isCollectingPoints) {
            const { lat, lng } = event.lngLat;
            // console.log(lat)
            const newPoints = [...points, { latitude: lat, longitude: lng }];
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
        setSelectedWaypoint([])
        setIsCollectingPoints(true);
        setPoints([]);
    }


    function getListener(ros) {
        var ne = new ROSLIB.Topic({
            ros: ros,
            name: '/gps_based_navigation/gps/filtered',
            messageType: 'sensor_msgs/NavSatFix'
        });
        return ne;
    }



    const threshold = 1e-6;

    const updateRobotPoseHistory = (pose) => {
        setRobotPose(pose)
        var r = robotPoseHistory;
        r.push(pose)
        // console.log(r)
        setRobotPoseHistory(r)
    }


    const trackRobot = () => {
        // mapRef.current = map;
        const ros = rosRef.current;
        setTrackingRobot(true);
        // console.log(ros)
        if (ros && ros.isConnected) {
            const listener = getListener(ros)
            var lastPose = center;

            listener.subscribe((message) => {
                // console.log(message);
                var pose = { latitude: message.latitude, longitude: message.longitude }

                var del = { latitude: Math.abs(pose.latitude - lastPose.latitude), longitude: Math.abs(pose.longitude - lastPose.longitude) }
                if (del.latitude < threshold && del.longitude < threshold) {
                    return;
                }

                updateRobotPoseHistory(pose)

                lastPose = pose;
                // console.log(robotPoseHistoryData)

            });
        }
    }

    const stopTracking = () => {
        const ros = rosRef.current;
        const listener = getListener(ros);
        listener.unsubscribe();
    }


    const onRosConnected = () => {
        const ros = rosRef.current;
        if (ros && ros.isConnected) {
            console.log("ROS Connected")
            const centerListener = getListener(ros)

            centerListener.subscribe(function (message) {
                console.log(message);
                // setCenter({ latitude: message.latitude, longitude: message.longitude })
                onCenterChange({ latitude: message.latitude, longitude: message.longitude })
                setRobotPose({ latitude: message.latitude, longitude: message.longitude });
                centerListener.unsubscribe();
            });
        }

    }


    const onCenterChange = ({ longitude, latitude }) => {
        mapRef.current?.flyTo({ center: [longitude, latitude], duration: 1000 });
    };


    const waypointData = useMemo(() => {
        const geojson = {
            type: "LineString",
            coordinates: selectedWaypoint.map((point) => ([point.longitude, point.latitude]))
        }
        // console.log(geojson)
        return geojson
    }, [selectedWaypoint]);

    // const robotPoseHistoryData = useMemo(() => {
    //     const geojson = {
    //         type: "LineString",
    //         coordinates: robotPoseHistory.map((point) => [point.longitude, point.latitude])
    //     }
    //     console.log(geojson)
    //     return geojson
    // }, [robotPoseHistory]);


    const actionSendWaypointToRobot = () => {
        if (selectedWaypoint === undefined) {
            return
        }


        const waypoint = selectedWaypoint;
        const ros = rosRef.current;
        if (ros && ros.isConnected) {
            const listener = new ROSLIB.Topic({
                ros: ros,
                name: '/gps_waypoint/goal',
                messageType: 'gps_based_navigation/GoToWaypointActionGoal'
            })
            console.log(listener)
            var messages = waypoint.map((point, index) => {
                return new ROSLIB.Message(point)
            })

            const msg = new ROSLIB.Message({
                goal: { points: messages }
            })
            // listener.publish(msg)
            // const goal = new ROSLIB.Message({
            console.log("Sent waypoint to robot.")
            const fibonacciClient = new ROSLIB.ActionClient({
                ros: ros,
                serverName: 'gps_waypoint',
                actionName: 'gps_based_navigation/GoToWaypointAction'
            });
            // console.log(waypoint);
            var goal = new ROSLIB.Goal({
                actionClient: fibonacciClient,
                goalMessage: {
                    points: messages
                }
            });

            goal.on("error", function (er) {
                console.log(er)
            })

            goal.on('feedback', function (feedback) {
                console.log('Feedback: ' + feedback.sequence);
            });

            goal.on('result', function (result) {
                console.log('Final Result: ' + result.result);
            });
            goal.send()
        }

    };

    return <Container>
        <Grid.Container>
            <Grid xs={3}>
                <div>
                    <div>
                        <Text h1>Controls</Text>
                        <RosConnection ref={rosRef} onRosConnected={onRosConnected} />
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
                            <Button onPress={stopTracking}>Stop Tracking</Button>
                        </div>
                    </div>
                    <div>
                        <Text h1>Waypoints</Text>
                        <Grid>
                            {waypoints.map((waypoint, index) => (
                                <Collapse title={`Waypoint ${index + 1}`} key={index} subtitle={<Text>{waypoint.length} points. <Link onClick={(evt) => { evt.preventDefault(); setSelectedWaypoint(waypoint); onCenterChange({ longitude: waypoint[0].longitude, latitude: waypoint[0].latitude }); }} href="#">See on map </Link></Text>}><Text>{JSON.stringify(waypoint)}</Text></Collapse>

                            ))}
                        </Grid>
                    </div>
                    <Button onPress={actionSendWaypointToRobot}>Send waypoint to robot</Button>
                </div>


            </Grid>

            <Grid xs={9} css={{ height: "100vh" }}>
                <Map
                    mapboxAccessToken={process.env.REACT_APP_MAPBOX_API_KEY}
                    style={{ width: "100%", height: "100vh" }}
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                    ref={mapRef}
                    // onLoaded={handleApiLoaded}
                    onLoad={() => {
                        if (robotPose)
                            onCenterChange(robotPose)
                    }}
                    initialViewState={{
                        latitude: center.latitude,
                        longitude: center.longitude,
                        zoom: 20,
                    }}
                    cursor={isCollectingPoints ? "crosshair" : "default"}
                    onClick={handleMapClick}
                    style={{ width: "100%", height: "100vh" }}
                >

                    <Source id="polylineLayer" type="geojson" data={waypointData}>
                        <Layer
                            id="lineLayer"
                            type="line"

                            layout={{
                                "line-join": "round",
                                "line-cap": "round"
                            }}
                            paint={{
                                "line-color": "rgba(3, 170, 238, 0.5)",
                                "line-width": 5
                            }}
                        />
                    </Source>




                    {robotPose && <Marker
                        longitude={robotPose.longitude}
                        latitude={robotPose.latitude}
                        anchor="center"
                        color="red"
                    />}
                    {selectedWaypoint.map((point, index) => (
                        <Marker
                            key={`marker-${index}`}
                            longitude={point.longitude}
                            latitude={point.latitude}
                            anchor="center"
                            onClick={e => {
                                // If we let the click event propagates to the map, it will immediately close the popup
                                // with `closeOnClick: true`
                                e.originalEvent.stopPropagation();

                            }}
                        />
                    ))}

                    {points.map((point, index) => (
                        <Marker
                            key={`marker-${index}`}
                            longitude={point.longitude}
                            latitude={point.latitude}
                            anchor="center"
                            onClick={e => {
                                // If we let the click event propagates to the map, it will immediately close the popup
                                // with `closeOnClick: true`
                                e.originalEvent.stopPropagation();
                                var poi = points;
                                poi.splice(index, 1);
                                setPoints(poi);
                            }}
                        />
                    ))}

                </Map>

            </Grid>
        </Grid.Container>
    </Container >
}





export default GMap;