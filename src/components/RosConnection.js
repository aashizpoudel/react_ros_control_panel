import { Button, Col, Input, Text } from '@nextui-org/react';
import ROS from 'roslib'
import { forwardRef, useEffect, useRef, useState } from 'react';
const RosConnection = forwardRef((props, ref) => {
    const [message, setMessage] = useState("")
    const { onRosConnected } = props;
    const [hostname, setHostname] = useState("ws://localhost:9090");
    const ros = ref;


    function load_ros(url) {

        ros.current = new ROS.Ros({ url: url })

        console.log(ros)

        const ros_ = ros.current;
        ros_.on('connection', function () {
            setMessage("connected...")
            onRosConnected({ url: url })
        })

        ros_.on("error", function (error) {
            setMessage("error...")
            console.log(error)
        })
        // return ros_
    }

    useEffect(() => {
        load_ros(hostname);

        return () => {
            const ros_ = ros.current;
            if (ros_ !== undefined) {
                console.log("closing");
                ros_.close();
            }
        }
    }, [hostname])


    function connectFunction() {
        const url = hostnameRef.current.value;
        console.log(url);
        if (ros.current !== null) {
            console.log("in")
            ros.current.close();
        }
        load_ros(url)
    }

    const hostnameRef = useRef()


    return (
        <Col align='center'>
            <Input ref={hostnameRef} css={{ mb: "$5" }} label="Host" initialValue={hostname} />
            <Button onPress={connectFunction}>Re-Connect</Button> <Text>{message}</Text></Col>

    );
})

export default RosConnection;
