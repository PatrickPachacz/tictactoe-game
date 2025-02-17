const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let rooms = {}; 

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { board: Array(9).fill(null), turn: "X" };
    }


    io.to(roomId).emit("game-state", rooms[roomId]);

    console.log(`User joined room: ${roomId}`);
  });

  socket.on("make-move", ({ roomId, index }) => {
    if (rooms[roomId] && rooms[roomId].board[index] === null) {
      rooms[roomId].board[index] = rooms[roomId].turn;
      

      const winner = checkWinner(rooms[roomId].board);
      if (winner) {
        io.to(roomId).emit("game-over", { winner });
      } else {
        rooms[roomId].turn = rooms[roomId].turn === "X" ? "O" : "X";
        io.to(roomId).emit("game-state", rooms[roomId]);
      }
    }
  });

  socket.on("reset-game", (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId] = { board: Array(9).fill(null), turn: "X" };
      console.log(`Game reset for room: ${roomId}`);
      io.to(roomId).emit("game-state", rooms[roomId]);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

function checkWinner(board) {
  const winPatterns = [
    [0, 1, 2], 
    [3, 4, 5], 
    [6, 7, 8], 
    [0, 3, 6], 
    [1, 4, 7], 
    [2, 5, 8], 
    [0, 4, 8], 
    [2, 4, 6], 
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; 
    }
  }

  return null; 
}

server.listen(3000, () => console.log("Server running on port 3000"));
