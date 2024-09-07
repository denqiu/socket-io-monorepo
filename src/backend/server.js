import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"]
	}
});

io.on('connection', (socket) => {
	socket.on("ENTER_ROUTE", (route) => {
		socket.join(route);
	});
	socket.on("EXIT_ROUTE", (route) => {
		socket.leave(route);
	});
});