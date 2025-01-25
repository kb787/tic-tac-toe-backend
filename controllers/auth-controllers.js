const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../configuration/dbConfiguration");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const register = (req, res) => {
  const { username, password } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

  db.run(query, [username, hashedPassword], function (err) {
    if (err) {
      return res.status(400).json({ error: "Username already exists" });
    }
    res
      .status(201)
      .json({
        userId: this.lastID,
        message: "Registered successfully",
      });
  });
};

const login = (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = ?`;

  db.get(query, [username], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({
      access_token: token,
      userId: user.id,
      message: "Successfully logged In",
    });
  });
};

module.exports = { register, login };
