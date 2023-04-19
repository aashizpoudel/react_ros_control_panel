<h1>React Control Panel for ROS</h1>
<p>This repository contains a web-based control panel for controlling robots running on the Robot Operating System (ROS) framework. It is built using React and communicates with ROS through the rosbridge_server suite and web_video_server.</p>
<h2>Installation</h2>
<p>To use this control panel, you must first install the required ROS nodes:</p>

<code>sudo apt install ros-noetic-rosbridge-server ros-noetic-web-video-server
rosrun web_video_server web_video_server
rosrun rosbridge_server rosbridge_websocket</code>
<p>Once you have installed these nodes, you can download this repository and run the control panel using the following commands:</p>

<code>git clone https://github.com/aashizpoudel/react_ros_control_panel.git
cd react_ros_control_panel
npm install
npm start</code>
<p>The control panel should now be accessible from your web browser at http://localhost:3000/.</p>
<h2>Usage</h2>
<p>Once the control panel is running, you can use it to send commands to your robot and view its video feed. The interface is designed to be intuitive and easy to use, with separate sections for controlling movement, arm positioning, and camera settings.</p>
<p>For now, the control panel connects to the ROSBridge server at port 9090. Image preview streams are handled using web_video_server running on port 8080.</p>
<!-- <h2>License</h2>
<p>This software is licensed under the MIT license. See the LICENSE file for more information.</p> -->