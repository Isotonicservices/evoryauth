const Database = require("better-sqlite3");
const db = new Database("dev.db");

try {
  const users = db.prepare("SELECT * FROM User").all();
  const apps = db.prepare("SELECT * FROM Application").all();
  console.log("USERS:", JSON.stringify(users, null, 2));
  console.log("APPLICATIONS:", JSON.stringify(apps, null, 2));
} catch (e) {
  console.error("Database read error:", e);
} finally {
  db.close();
}
