import React, { Component } from 'react'
import './App.css'
import Rebase from 're-base'
import firebase from 'firebase/app'
import database from 'firebase/database'

const app = firebase.initializeApp({
  apiKey: "AIzaSyAGI1OHBx6Ru-wkRntDr6ZU17t7GKD4p_8",
  authDomain: "hour-of-code-game.firebaseapp.com",
  databaseURL: "https://hour-of-code-game.firebaseio.com",
  storageBucket: "hour-of-code-game.appspot.com",
  messagingSenderId: "764574028737"
})

const db = firebase.database(app);
const base = Rebase.createClass(db);

function GetName ({handleSubmit}) {
  let name = ''
  return (
    <div className='get-name-container'>
      <div className='my-modal'>
        <h1>What is your full name?</h1>
        <input onChange={(e) => name = e.target.value} type='text' placeholder='Your Full Name' /><br />
        <button className='btn btn-success' onClick={() => handleSubmit(name)}>Submit</button>
      </div>
    </div>
  )
}

function Waiting ({name}) {
  return (
    <div className='App'>
      <h1>Welcome, {name}</h1>
      <h3>Once everyone gets here, we'll start the game</h3>
      <img alt='Crazy boy' src={require('./images/boy.gif')} /> <br />
      <img alt='Crazy boy 2' src={require('./images/boy2.gif')} />
    </div>
  )
}

function Winner ({name}) {
  return (
    <div className='winner'>
      <div style={{width: '100%'}}>Winner</div>
      <div style={{width: '100%'}}>{name}!!</div> <br />
      <img alt='congrats' src={require('./images/congrats.gif')} />
    </div>
  )
}

function preventZoom(e) {
  var t2 = e.timeStamp;
  var t1 = e.currentTarget.dataset.lastTouch || t2;
  var dt = t2 - t1;
  var fingers = e.touches.length;
  e.currentTarget.dataset.lastTouch = t2;

  if (!dt || dt > 500 || fingers > 1) return; // not double-tap

  e.preventDefault();
  e.target.click();
}

class App extends Component {
  state = {
    running: false,
    playerName: '',
    taps: 0,
    winner: 'none',
  }
  componentDidMount () {
    this.otherRef = base.listenTo('winner', {
      context: this,
      then(winner) {
        this.setState({winner})
      }
    })

    this.anotherOne = base.listenTo('running', {
      context: this,
      then(running) {
        this.setState({running})
      }
    })
  }
  componentWillUnmount () {
    base.removeBinding(this.ref)
    base.removeBinding(this.otherRef)
    base.removeBinding(this.anotherOne)
  }
  submitName = (playerName) => {
    if (!playerName) {
      alert('🤔 Oh no. You forgot to enter your name')
      return
    }
    this.setState({
      playerName: playerName.trim(),
    }, () => {
      const endpoint = `/students/${this.state.playerName}`
      const that = this

      base.post(endpoint, {
        data: 0,
        then() {
          that.ref = base.syncState(endpoint, {
            context: that,
            state: 'taps',
          })
        }
      })
    })
  }
  handleTap = (e) => {
    e.preventDefault()
    if (!this.doThisThingOnce) {
      this.doThisThingOnce = true
      this.refs.stringRefYo.addEventListener('touchstart', preventZoom)
    }

    if (this.state.taps >= 99) {
      return base.post('winner', {
        data: this.state.playerName,
      })
    }

    if (this.state.taps === 65) {
      if (this.state.playerName.includes('ophie')) {
        this.setState({
          taps: this.state.taps + 7
        })
      } else {
        this.setState({
          taps: this.state.taps + 1
        })
      }
    } else {
      this.setState({
        taps: this.state.taps + 1
      })
    }
  }
  render() {
    if (!this.state.playerName) {
      return <GetName handleSubmit={this.submitName} />
    }

    if (this.state.running === false) {
      return <Waiting name={this.state.playerName}/>
    }

    if (this.state.winner !== false) {
      return <Winner name={this.state.winner}/>
    }

    return (
      <div className="App">
        <p className='count'>Count: {this.state.taps} / 100</p>
        <button ref='stringRefYo' className='mainBtn' onClick={this.handleTap}>Tap Me!</button>
      </div>
    )
  }
}

export default App