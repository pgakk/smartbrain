import React, { Component } from 'react';
import Particles from 'react-particles-js';
// import Clarifai from 'clarifai';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

// const app = new Clarifai.App({
//  apiKey: 'b69bea40fc9f4121a51ae94d378a9111'
// });

const particlesOptions = {
  particles: {
    number: {
      value: 80,
      density : {
        enable: true,
        value_area: 800
      }
    }
  },

  interactivity : {
    detect_on: 'window',
    events : {
      onhover: {
        enable: true,
        mode: 'repulse'
      }
    }
  }
}

const initialState = {
  input : '',
  imageUrl : '',
  box : {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id:'',
    name:'',
    email:'',
    entries:0,
    timestamp: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      timestamp: data.timestamp
    }});
  }

  calculateFaceLocation = (data) => {
    const faceCoords = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: faceCoords.left_col * width,
      topRow: faceCoords.top_row * height,
      rightCol: width - (faceCoords.right_col * width),
      bottomRow: height - (faceCoords.bottom_row * height)      
    };
  }

  displayBoundingBox = (box) => {
    this.setState({box : box});
  }

  onInputChange = (event) => {
    this.setState({input : event.target.value});
  }

  onButtonClick = () => {
    const {input, user} = this.state;
    this.setState({imageUrl : input});
    //app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({
        input
      })
    })
    .then(response => response.json())
    .then(response => {
      if(response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type' : 'application/json'},
          body: JSON.stringify({
            id: user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(user, {entries: count}));
        })
        .catch(console.log);
      }
      this.displayBoundingBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.error(err));
  }

  onRouteChange = (route) => {
    if(route === 'signin')
      //this.setState({isSignedIn : false, imageUrl : ''});
      this.setState(initialState);
    else if(route === 'home')
      this.setState({isSignedIn : true});
    this.setState({route});
  }

  render() {
    const {isSignedIn, route, box, imageUrl} = this.state;
    const {name, entries} = this.state.user;
    return (
      <div className="App">
        <Particles className ='particles' params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { 
          (route === 'home') ?
            <div>
              <Logo />
              <Rank name ={name} entries={entries}/>
              <ImageLinkForm onInputChange={this.onInputChange} onButtonClick={this.onButtonClick} />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (route === 'signin') ?
            <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        }
      </div>
    );
  }
}

export default App;
