const {
  startGame,
  makeMove,
  getUserGames,
} = require("./../controllers/game-controllers");
const express = require("express");
const gameRouter = express.Router();

gameRouter.post("/game/start-game", startGame);
gameRouter.post("/game/make-move", makeMove);
gameRouter.get("/game/get-user-games", getUserGames);

module.exports = gameRouter;
