const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.resolve(__dirname, "tic-tac-toe.db"),
  (err) => {
    if (err) {
      console.error("Database connection error:", err.message);
    } else {
      console.log("Connected to the database");
      migrateDatabase();
    }
  }
);

const migrations = [
  {
    name: "001-initial-schema",
    up: `
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE user_profiles (
        id INTEGER PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        bio TEXT,
        avatar_url TEXT,
        total_games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        FOREIGN KEY(id) REFERENCES users(id)
      );

      CREATE TABLE games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_id INTEGER NOT NULL,
        player2_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        winner_id INTEGER,
        board TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(player1_id) REFERENCES users(id),
        FOREIGN KEY(player2_id) REFERENCES users(id),
        FOREIGN KEY(winner_id) REFERENCES users(id)
      );

      CREATE TABLE moves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        position INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(game_id) REFERENCES games(id),
        FOREIGN KEY(player_id) REFERENCES users(id)
      );
    `,
    down: `
      DROP TABLE IF EXISTS moves;
      DROP TABLE IF EXISTS games;
      DROP TABLE IF EXISTS user_profiles;
      DROP TABLE IF EXISTS users;
    `,
  },
  {
    name: "002-add-migration-tracking",
    up: `
      CREATE TABLE migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `,
    down: `
      DROP TABLE IF EXISTS migrations;
    `,
  },
];

function runMigration(migration, direction = "up") {
  return new Promise((resolve, reject) => {
    db.exec(migration[direction], (err) => {
      if (err) {
        reject(err);
      } else {
        if (direction === "up") {
          db.run(
            "INSERT INTO migrations (name) VALUES (?)",
            [migration.name],
            (insertErr) => (insertErr ? reject(insertErr) : resolve())
          );
        } else {
          db.run(
            "DELETE FROM migrations WHERE name = ?",
            [migration.name],
            (deleteErr) => (deleteErr ? reject(deleteErr) : resolve())
          );
        }
      }
    });
  });
}



async function migrateDatabase() {
  try {
    // Check if migrations table exists before creating it
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'`,
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (!tableExists) {
      console.log("Creating migrations table...");
      await runMigration(migrations[1]);
    } else {
      console.log("Migrations table already exists. Skipping creation.");
    }

    for (const migration of migrations) {
      const checkMigration = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM migrations WHERE name = ?",
          [migration.name],
          (err, row) => (err ? reject(err) : resolve(row))
        );
      });

      if (!checkMigration) {
        console.log(`Applying migration: ${migration.name}`);
        await runMigration(migration);
      }
    }

    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    db.close();
  }
}

module.exports = { migrations, runMigration, migrateDatabase };
