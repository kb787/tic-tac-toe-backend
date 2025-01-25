const { register, login } = require("../controllers/auth-controllers");
const express = require("express");
const authRouter = express.Router();

authRouter.post("/auth/register", register);
authRouter.post("/auth/login", login);

module.exports = authRouter;
