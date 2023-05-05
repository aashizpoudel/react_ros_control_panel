import { Row } from "@nextui-org/react";
import { Joystick } from "https://esm.sh/react-joystick-component@6.2.0"
import { useRef, useState } from "react";
import ROSLIB from "roslib";


const TeleOp = ({ ros }) => {

    const [joyMsg, setJoyMsg] = useState({ x: null, y: null })
    const joyRef = useRef();

    const onMove = (x) => {
        setJoyMsg(x)
        if (joyRef.current !== undefined) {
            clearInterval(joyRef.current)
        }
        joyRef.current = setInterval(sendCmdVelMessage, 50);

    }

    const onStop = ({ x, y }) => {
        setJoyMsg({ x, y });
        clearInterval(joyRef.current)
    }


    const sendCmdVelMessage = () => {
        var { x, y } = joyMsg;
        if (x === null && y === null) {
            return
        }
        x = Math.abs(x) < 0.1 ? 0 : x;
        y = Math.abs(y) < 0.1 ? 0 : y;
        const message = new ROSLIB.Message({
            linear: {
                x: y * 0.4,
                y: 0,
                z: 0,
            },
            angular: {
                x: 0,
                y: 0,
                z: x * 0.6,
            }
        }
        );

        const ros_ = ros;
        if (ros_ && ros_.isConnected) {
            const publisher = new ROSLIB.Topic({
                ros: ros_,
                name: "/cmd_vel",
                messageType: "geometry_msgs/Twist"
            })

            publisher.publish(message);

        }
    }



    return <Row justify='center'>
        <Joystick move={(x) => { console.log(x); onMove(x) }} stop={(e) => { console.log(e); onStop(e) }} />
    </Row>
}

export default TeleOp;