import React, { Component } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import "./App.css";
import { RestClient } from "./api/restClient";

const spotifyApi = new SpotifyWebApi();
const restClient = new RestClient("http://localhost:3300");

// https://medium.com/@jonnykalambay/now-playing-using-spotifys-awesome-api-with-react-7db8173a7b13
class App extends Component {
  constructor() {
    super();
    const params = window.location.search.substring(1);
    const urlParams = new URLSearchParams(params);
    const token = urlParams.get("access_token");
    const spotifyId = urlParams.get("id");
    const id = spotifyId || "";

    if (token) {
      spotifyApi.setAccessToken(token);
    }

    this.state = {
      id,
      token,
      loggedIn: !!token,
      nowPlaying: { name: "Not Checked", albumArt: "" },
      error: false,
      roomCode: "",
      createdRoomCode: "",
    };
  }

  render() {
    const { loggedIn, error, roomCode, createdRoomCode } = this.state;
    return (
      <div className="App">
        <main className="App-header">
          Music Room
          {!loggedIn && <a href="http://localhost:3300/login">Login</a>}
          {loggedIn &&
          <button onClick={this.getNowPlaying}>
            Check Now Playing
          </button>
          }

          <section>
            Now Playing: {this.state.nowPlaying.name}
          </section>

          <section>
            <button onClick={this.createChatRoom}>
              Create Chat Room
            </button>
          </section>
          {error && <h1>
            An error occurred
          </h1>}
          <h3>In room {roomCode}</h3>

          <section>
            <input value={createdRoomCode} onChange={this.setCreatedRoomCode} />
            <button onClick={this.joinChatRoom}>
              Join Chat Room
            </button>
          </section>
        </main>
      </div>
    );
  }

  setCreatedRoomCode = (event) => {
    this.setState({
      createdRoomCode: event.target.value,
    });
  };

  joinChatRoom = async() => {
    const { createdRoomCode, id, token } = this.state;
    try {
      const { data } = await restClient.joinRoom(createdRoomCode, id, token);
      const { roomCode } = data;
      this.setState({
        roomCode,
      });
    } catch(err) {
      console.log(err);
      this.setState({
        error: true,
      });
    }
  };

  createChatRoom = async() => {
    try {
      const { id, token } = this.state;
      const { data } = await restClient.createRoom(id, token);
      const { roomCode } = data;
      this.setState({
        roomCode,
      });
    } catch(err) {
      console.log(err);
      this.setState({
        error: true,
      });
    }
  };

  getNowPlaying = async() => {
    const song = await spotifyApi.getMyCurrentPlaybackState();
    const { name } = song.item;
    this.setState({
      nowPlaying: {
        name,
      },
    });
  };
}

export default App;
