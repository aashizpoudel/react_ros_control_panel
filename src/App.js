import logo from './logo.svg';
import './App.css';
import { Button, Card, Col, Container, Dropdown, Grid, Input, NextUIProvider, Row, Text } from '@nextui-org/react';
import ROS from 'roslib'
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
function App() {
  const [message, setMessage] = useState("")
  const [hostname, setHostname] = useState('ws://localhost:9090');
  const [previewUrl, setPreviewUrl] = useState('logo.svg')

  const [previewtopic, setPreviewtopic] = useState('')
  const previewValue = useMemo(
    () => Array.from(previewtopic).join(", "),
    [previewtopic]
  );
  const [isPreviewing, setIsPreviewing] = useState(false)




  const [topicsToRecord, setTopicsToRecord] = useState([])
  // const [topicsToRecordValue,setTopicsToRecordValue] = useState(
  const topicsToRecordValue = useMemo(
    () => Array.from(topicsToRecord).join(", ").replaceAll("_", " "),
    [topicsToRecord]
  );
  const [allTopics, setAllTopics] = useState([])
  const rosRef = useRef(null);
  const imageRef = useRef(null)


  function load_ros() {

    rosRef.current = new ROS.Ros({ url: hostname })

    const ros_ = rosRef.current;
    ros_.on('connection', function () {
      setMessage("connected...")
    })

    ros_.on("error", function (error) {
      setMessage("error...")
      console.log(error)
    })

    ros_.getTopics((data) => {
      console.log(data);
      const { topics, types } = data;
      // const topics_ = []
      const topics_ = topics.map((topic, index) => {
        return { topic, type: types[index] };
      })

      setAllTopics(topics_);
    });
    // return ros_
  }

  useEffect(() => {
    if (rosRef.current === null) {
      load_ros()
    }

    const ros_ = rosRef.current;
    // ros.connect();
    return () => {
      // console.log(url)
      if (ros_.isConnected)
        ros_.close()
    }
  }, [hostname])


  const parsedHostname = useMemo(() => {
    return hostname.split("//")[1].split(":")[0]
  }, [hostname]);


  function connectFunction() {
    if (rosRef.current !== null) {
      rosRef.current.close();
    }

    load_ros()
  }


  function previewFunction() {
    const ros_ = rosRef.current
    if (!ros_.isConnected) {
      return
    }
    var topic = previewValue;
    setIsPreviewing(true);
    // console.log(topic.length)
    if (topic.length > 0) {
      console.log(topic)

      setPreviewUrl(`http://${parsedHostname}:8080/stream?topic=${topic}`);


    }

  }

  const imageTopics = useMemo(() => {
    return allTopics.filter(item => item.type === 'sensor_msgs/Image').map(item => item.topic)
  }, [allTopics]);





  return (
    <NextUIProvider>
      <div className="App">
        <div>

        </div>
        <header className="">
          <Text h2>Control Center</Text>
        </header>
        <Container>

          <Grid.Container gap={1} justify="start" alignContent='start'>
            <Grid direction='column' xs={12} md={3}>
              <Card isHoverable variant='bordered'>
                <Card.Header>
                  <Text>Connection</Text>
                </Card.Header>
                <Card.Divider />
                <Card.Body>
                  <Input css={{ mb: "$5" }} label="Host" value={hostname} onChange={function (e) { setHostname(e.target.value) }} />
                  <Button onPress={connectFunction}>Re-Connect</Button> <Text p>{message}</Text>
                </Card.Body>
              </Card>
              <Card isHoverable variant='bordered' css={{ mt: "$5" }}>

                <Card.Header>
                  <Text>Other links</Text>
                </Card.Header>
                <Card.Divider />
                <Card.Body>
                  <Link target='_blank' to="/map"><Button css={{ my: "$5" }}>Map Based Navigation</Button></Link>

                </Card.Body>
              </Card>
            </Grid>
            <Grid direction='column' xs={12} md={3}>
              <Card isHoverable variant='bordered'>
                <Card.Header>
                  <Text>Image preview</Text>
                </Card.Header>
                <Card.Divider />
                <Card.Body>
                  <img alt='stream' width={"100%"} src={previewUrl} ref={imageRef} />
                  <Dropdown>
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
                      {imageTopics.map((item) => <Dropdown.Item key={item}>{item}</Dropdown.Item>)}

                    </Dropdown.Menu>
                  </Dropdown>
                  <Button css={{ mb: "$5" }} onPress={previewFunction}>Preview</Button>
                  {isPreviewing && <Button onPress={() => { setIsPreviewing(false); setPreviewUrl('logo.svg') }}>Stop</Button>}
                </Card.Body>
              </Card>


            </Grid>

            <Grid xs={12} md={6}>
              <Card variant="bordered" isHoverable>
                <Card.Header>
                  <Text>Topic Recorder</Text>
                </Card.Header>
                <Card.Divider />
                <Card.Body>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}><Dropdown >
                    <Dropdown.Button color="secondary" css={{ mb: "$5" }}>
                      {topicsToRecordValue}
                    </Dropdown.Button>
                    <Dropdown.Menu
                      aria-label="Single selection actions"
                      color="secondary"
                      disallowEmptySelection={false}
                      selectionMode="multiple"

                      selectedKeys={topicsToRecord}
                      onSelectionChange={setTopicsToRecord}
                      items={allTopics}
                    >
                      {(item) => <Dropdown.Item withDivider key={item.topic}>{item.topic}</Dropdown.Item>}

                    </Dropdown.Menu>
                  </Dropdown>


                    <Button>Start</Button>

                    <Text p>Status</Text>
                    <Button css={{ my: "$5" }}>Stop</Button></div>

                </Card.Body>
              </Card>
            </Grid>

          </Grid.Container>





        </Container>

      </div>
    </NextUIProvider>
  );
}

export default App;
