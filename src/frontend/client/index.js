import Client from "./lib.js";

const client = new Client();
client.connect();
client.loadSingleEvents(
	handleSuccess = (response) => console.log(response),
	handleError = (error) => console.error(`Error: ${error}`)
);