import axios from "axios/index";

export class RestClient {
  axiosInstance;

  constructor(baseUrl) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 1000,
    });
  }

  async createRoom(spotifyId, accessToken) {
    return await this.axiosInstance.post("/createRoom", {
      params: {
        spotifyId,
        accessToken,
      },
    });
  }

  async joinRoom(roomCode, spotifyId, accessToken) {
    return await this.axiosInstance.post("/joinRoom", {
      params: {
        roomCode,
        spotifyId,
        accessToken,
      },
    });
  }
}