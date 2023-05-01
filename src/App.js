import logo from './logo.svg';
import './App.css';
import { Button, Card, Col, Container, Dropdown, Input, NextUIProvider, Row, Text } from '@nextui-org/react';
import ROS from 'roslib'
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
function App() {
  const [message, setMessage] = useState("")
  const [hostname, setHostname] = useState('ws://localhost:9090');
  const [previewtopic, setPreviewtopic] = useState('')
  const previewValue = useMemo(
    () => Array.from(previewtopic).join(", "),
    [previewtopic]
  );
  const [capturetopic, setCapturetopic] = useState('')
  const captureValue = useMemo(
    () => Array.from(capturetopic).join(", "),
    [capturetopic]
  );
  const [topics, setTopics] = useState([])
  const ros = useRef(null);
  const imageRef = useRef(null)

  function filterTopics(data) {
    var topics = data.topics;
    topics = topics.filter(function (item, i) {
      return data.types[i] === "sensor_msgs/Image"
    })
    setTopics(topics)
  }

  function load_ros() {

    ros.current = new ROS.Ros({ url: hostname })

    // console.log(url)

    const ros_ = ros.current;
    ros_.on('connection', function () {
      setMessage("connected...")
    })

    ros_.on("error", function (error) {
      setMessage("error...")
      console.log(error)
    })

    ros_.getTopics(filterTopics);
    // return ros_
  }
  useEffect(() => {
    if (ros.current === null) {
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


  function previewFunction() {
    const ros_ = ros.current
    if (!ros_.isConnected) {
      return
    }
    var topic = previewValue;
    // console.log(topic.length)
    if (topic.length > 0) {
      console.log(topic)
      var listener = new ROS.Topic({
        ros: ros_,
        name: topic,
        messageType: 'sensor_msgs/Image'
      });
      console.log(listener)
      listener.subscribe(function (message) {
        console.log("received")
        // console.log(message.data)
        imageRef.current.src = `http://${hostname}:8080/stream?topic=${topic}`
        listener.unsubscribe()
      })

    }

  }


  return (
    <NextUIProvider>
      <div className="App">
        <header className="">
          <Text h2>Control Center</Text>
        </header>
        <Container css={{ maxW: "900px" }}>
          <Row justify='start' align='start'>
            <Col align='center'>
              <Card css={{ w: "50%" }}>
                <Card.Body>
                  <Row>
                    <img width={"100%"} src={logo} ref={imageRef} />
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row css={{ paddingTop: "$10" }} justify="start" align="start">
            <Col md align='center'>
              <Input css={{ mb: "$5" }} label="Host" value={hostname} onChange={function (e) { setHostname(e.target.value) }} />
              <Button onPress={connectFunction}>Re-Connect</Button> <Text p>{message}</Text>

              <Link target='_blank' to="/map"><Button css={{ my: "$5" }}>Map Based Navigation</Button></Link>
            </Col>
            <Col md align='center'><Dropdown>
              <Dropdown.Button flat color="secondary" css={{ mb: "$5" }}>
                {previewValue}
              </Dropdown.Button>
              <Dropdown.Menu
                aria-label="Single selection actions"
                color="secondary"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={previewtopic}
                onSelectionChange={setPreviewtopic}
              >
                {topics.map((item) => <Dropdown.Item key={item}>{item}</Dropdown.Item>)}

              </Dropdown.Menu>
            </Dropdown>
              <Button onPress={previewFunction}>Preview</Button>
            </Col>


            <Col md align='center'>
              <Dropdown>
                <Dropdown.Button flat color="secondary" css={{ mb: "$5" }}>
                  {captureValue}
                </Dropdown.Button>
                <Dropdown.Menu
                  aria-label="Single selection actions"
                  color="secondary"
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={capturetopic}
                  onSelectionChange={setCapturetopic}
                >
                  {topics.map((item) => <Dropdown.Item key={item}>{item}</Dropdown.Item>)}

                </Dropdown.Menu>
              </Dropdown>


              <Button>Photo</Button>

              <Text p>Video</Text>
              <Button css={{ my: "$5" }}>Start</Button>
              <Button>Stop</Button>


            </Col>

          </Row>


        </Container>

      </div>
    </NextUIProvider>
  );
}

export default App;
