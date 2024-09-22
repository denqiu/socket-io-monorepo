import Client from "./lib.js";

const client = new Client();
client.testConnection();

const handleSuccess = (response) => console.log(response);
const handleError = (error) => console.error(`Error: ${error}`);
client.loadOneAtATimeEvents(handleSuccess, handleError);
client.loadParallelEvents(handleSuccess, handleError);