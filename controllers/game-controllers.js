const db = require('./../configuration/dbConfiguration')
const TicTacToe = require("./../utils/GameLogic");

const gameInstances = new Map();

const startGame = (req, res) => {
  const { player2Id } = req.body;
  const player1Id = req.user.id;

  if (player1Id === player2Id) {
    return res.status(400).json({ error: "Cannot play against yourself" });
  }

  const gameInstance = new TicTacToe();
  const gameBoard = gameInstance.board.join("");

  const query = `INSERT INTO games (player1_id, player2_id, status, board) VALUES (?, ?, ?, ?)`;

  db.run(
    query,
    [player1Id, player2Id, "IN_PROGRESS", gameBoard],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Game creation failed" });
      }

      gameInstances.set(this.lastID, gameInstance);
      res
        .status(201)
        .json({
          gameId: this.lastID,
          message: "Game initiated successfully",
        });
    }
  );
};


const makeMove = (req, res) => {
    const { gameId, position } = req.body;
    const playerId = req.user.id;
  
    const gameInstance = gameInstances.get(Number(gameId));
  
    if (!gameInstance) {
      return res.status(404).json({ error: "Game not found" });
    }
  
    try {
      const moveResult = gameInstance.makeMove(position);
  
      const updateQuery = `UPDATE games SET board = ?, status = ?, winner_id = ? WHERE id = ?`;
      const status = moveResult.winner
        ? moveResult.winner === "Draw"
          ? "DRAW"
          : "COMPLETED"
        : "IN_PROGRESS";
  
      const winnerId = moveResult.winner && moveResult.winner !== "Draw" ? playerId : null;
  
      db.run(updateQuery, [moveResult.board.join(""), status, winnerId, gameId], (err) => {
        if (err) {
          console.error("Database Update Error:", err.message);
          return res.status(500).json({ error: `Move update failed: ${err.message}` });
        }
  
        const moveRecordQuery = `INSERT INTO moves (game_id, player_id, position) VALUES (?, ?, ?)`;
        db.run(moveRecordQuery, [gameId, playerId, position]);
  
        res.status(201).json({
          message: "Move saved successfully",
          board: moveResult.board,
          winner: moveResult.winner,
          nextPlayer: moveResult.nextPlayer,
        });
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  

const getUserGames = (req, res) => {
    const userId = req.user.id;
  
    const query = `SELECT * FROM games WHERE player1_id = ? OR player2_id = ?`;
  
    db.all(query, [userId, userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching game data" });
      }
  
      res.status(200).json({
        games: rows,
        message:'Game data fetched successfully'
      });
    });
  };
  

module.exports = { startGame, makeMove , getUserGames };
