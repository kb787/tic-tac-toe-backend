const db = require("../configuration/dbConfiguration");

const createProfile = (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, email, bio, avatar_url } = req.body;

  db.get(
    "SELECT * FROM user_profiles WHERE id = ?",
    [userId],
    (checkErr, existingProfile) => {
      if (checkErr) {
        return res.status(500).json({ error: "Profile check failed" });
      }

      if (existingProfile) {
        return res.status(400).json({ error: "Profile already exists" });
      }

      const query = `
      INSERT INTO user_profiles (id, first_name, last_name, email, bio, avatar_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

      db.run(
        query,
        [userId, first_name, last_name, email, bio, avatar_url],
        function (err) {
          if (err) {
            return res.status(500).json({
              error: "Profile creation failed",
              details: err.message,
            });
          }

          res.status(201).json({
            message: "Profile created successfully",
            profileId: userId,
          });
        }
      );
    }
  );
};

const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, email, bio, avatar_url } = req.body;

  const query = `
    INSERT OR REPLACE INTO user_profiles (id, first_name, last_name, email, bio, avatar_url) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [userId, first_name, last_name, email, bio, avatar_url],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ error: "Profile update failed", details: err.message });
      }

      res.json({
        message: "Profile updated successfully",
        changes: this.changes,
      });
    }
  );
};

module.exports = { createProfile, updateProfile };
