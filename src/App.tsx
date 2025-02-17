import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000");

const App: React.FC = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [gameOver, setGameOver] = useState(false);
  const roomId = "game-room-1"; 


  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("game-state", (gameState) => {
      setBoard(gameState.board);
      setTurn(gameState.turn);
    });

    
    return () => {
      socket.off("game-state");
      socket.off("game-over");
    };
  }, []);

  const handleMove = (index: number) => {
    if (!gameOver && !board[index]) {
      socket.emit("make-move", { roomId, index });
    }
  };

  useEffect(() => {
    socket.on("game-over", ({ winner }) => {
      setGameOver(true);
      alert(`${winner} wins the game!`);
    });
  }, []);

  const handleReset = () => {
    socket.emit("reset-game", roomId);  
  };

  return (
    <div className="game">
      <h2>Multiplayer Tic-Tac-Toe</h2>
      <div className="board">
        {board.map((cell, index) => (
          <button key={index} onClick={() => handleMove(index)} className="cell" disabled={gameOver}>
            {cell}
          </button>
        ))}
      </div>
      <p>Turn: {turn}</p>
      <button onClick={handleReset}>Reset Game</button>
    </div>
  );
};

export default App;
