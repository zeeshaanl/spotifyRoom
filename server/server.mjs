import io from "socket.io";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import querystring from "querystring";
import request from "request-promise";
import cors from "cors";
import { generateRoomCode } from "./utils/generateRoomCode";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const ioServer = io.listen(2323);

const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET;

const redirect_uri = "http://localhost:3300/callback";

const rooms = new Map();

ioServer.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("message", "this is some data");
});

app.get("/login", function(req, res) {
  // your application requests authorization
  // https://developer.spotify.com/documentation/general/guides/scopes/
  console.log(" HERHERHEHR in login");
  const scope = "user-read-private user-read-email user-read-currently-playing user-read-playback-state streaming";
  res.redirect("https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
    }));
});

app.get("/callback", async(req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code,
      redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      "Authorization": "Basic " + (new Buffer(client_id + ":" + client_secret).toString("base64")),
    },
    json: true,
  };
  try {
    const { access_token, refresh_token } = await request.post(authOptions);

    // URL endpoints
    // https://developer.spotify.com/console/player/
    var options = {
      url: "https://api.spotify.com/v1/me",
      headers: { "Authorization": "Bearer " + access_token },
      json: true,
    };

    const { id } = await request.get(options);
    // console.log(theresp, "resp");
    res.redirect("http://localhost:3000/?" +
      querystring.stringify({
        access_token,
        refresh_token,
        id,
      }));
  } catch(error) {
    console.log(error, "IN ERR");
  }
});

app.post("/createRoom", (request, response) => {
  const { params } = request.body;
  const { spotifyId, accessToken } = params;
  const roomCode = generateRoomCode();
  if (rooms.has(roomCode)) {
    response.status(500).send("Something broke!");
    return;
  }
  rooms.set(roomCode, {
    members: new Map([[spotifyId], [{ spotifyId, accessToken }]]),
  });
  response.status(200).json({ roomCode });
});

app.post("/joinRoom", (request, response) => {
  const { params } = request.body;
  const { roomCode, spotifyId, accessToken } = params;
  console.log(request.body);
  if (!roomCode) {
    response.status(400).send("A room code is required");
    return;
  }
  if (!spotifyId) {
    response.status(400).send("A spotifyId is required");
    return;
  }
  if (!accessToken) {
    response.status(400).send("A accessToken is required");
    return;
  }
  if (!rooms.has(roomCode)) {
    response.status(422).send("The room code does not exist");
    return;
  }
  const selectedRoom = rooms.get(roomCode);

  // TODO fix map set
  selectedRoom.members.set(spotifyId, { spotifyId, accessToken });
  console.log(selectedRoom);
});

const server = app.listen(3300, () => {
  console.log("server is running on port", server.address().port);
});

