const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const app = express();
const DB_PATH = "./database.json";
const ADMIN = "944b";
const SECRET_API = "/krbX_RANDOM_api_92";

app.use(express.json());
app.use(express.static("public"));

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ===== API RANDOM SCRIPT =====
app.get(`${SECRET_API}/random`, async (req, res) => {
  const db = readDB();
  const user = req.query.user || "unknown";

  db.totalCommands++;
  db.users[user] = (db.users[user] || 0) + 1;
  writeDB(db);

  const page = Math.floor(Math.random() * 20) + 1;
  const api = `https://rscripts.net/api/v2/scripts?page=${page}&orderBy=date&sort=desc`;
  const { data } = await axios.get(api);

  const random = data.scripts[Math.floor(Math.random() * data.scripts.length)];
  res.json(random);
});

// ===== ADMIN DATA =====
app.get("/admin/data", (req, res) => {
  res.json(readDB());
});

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌐 Server running"));
