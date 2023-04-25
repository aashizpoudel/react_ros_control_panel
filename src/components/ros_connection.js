import { Button, Col, Input, Text } from '@nextui-org/react';
import ROS from 'roslib'
import { forwardRef, useEffect, useRef, useState } from 'react';
const RosConnection = forwardRef((props, ref) => {
    const [message, setMessage] = useState("")
    const [hostname, setHostname] = useState('ws://localhost:9090');
    const ros = ref;


    function load_ros() {

        ros.current = new ROS.Ros({ url: hostname })

        console.log(ros)

        const ros_ = ros.current;
        ros_.on('connection', function () {
            setMessage("connected...")
        })

        ros_.on("error", function (error) {
            setMessage("error...")
            console.log(error)
        })
        // return ros_
    }


    useEffect(() => {
        // console.log(ros)
        if (ros.current === undefined) {
            load_ros()
        }

        const ros_ = ros.current;
        // ros.connect();
        return () => {
            // console.log(url)
            if (ros_.isConnected)
                ros_.close()
        }
    }, [hostname])


    function connectFunction() {
        if (ros.current !== null) {
            ros.current.close();
        }

        load_ros()
    }



    return (
        <Col md align='center'><Input css={{ mb: "$5" }} label="Host" value={hostname} onChange={function (e) { setHostname(e.target.value) }} /> <Button onPress={connectFunction}>Re-Connect</Button> <Text p>{message}</Text></Col>

    );
})

export default RosConnection;
