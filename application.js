const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const dotenv = require("dotenv");
const authRouter = require("./routes/auth-routes");
const gameRouter = require("./routes/game-routes");
const profileRouter = require("./routes/profile-routes")
const {authMiddleware} = require("./middleware/authMiddleware");

dotenv.config();
const base_api = process.env.base_api;
const server_port = process.env.server_port || 3500;

app.use(express.json());
app.use(base_api, authRouter);
app.use(base_api,authMiddleware,gameRouter) ;
app.use(base_api,authMiddleware,profileRouter) ;

app.get("/", (req, res) => {
  return res.json({ message: "App running successfully" });
});
server.listen(server_port, () => {
  console.log(`Server running successfully on port ${server_port}`);
});
