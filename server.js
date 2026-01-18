const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const app = express();

// ========= CONFIG =========
const ADMIN_USERNAME = "944b";
const SECRET_API = "/krbX_RANDOM_api_92";
const DB_PATH = "./database.json";

// ========= SESSION =========
app.use(session({
  secret: "krbaq-secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ========= DISCORD AUTH =========
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_REDIRECT,
    scope: ["identify"]
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// ========= HELPERS =========
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function isAuth(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");
  next();
}

function isAdmin(req, res, next) {
  if (req.user.username !== ADMIN_USERNAME)
    return res.status(403).send("🚫 Admin only");
  next();
}

// ========= STATIC =========
app.use(express.static("public"));

// ========= AUTH ROUTES =========
app.get("/login", passport.authenticate("discord"));

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }),
  (req, res) => res.redirect("/")
);

app.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/login");
});

// ========= API =========
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

// ========= PAGES =========
app.get("/", isAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/admin", isAuth, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.get("/admin/data", isAuth, isAdmin, (req, res) => {
  res.json(readDB());
});

// ========= START =========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 Server running on port", PORT));
