const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const API = "https://krbaq.onrender.com/krbX_RANDOM_api_92/random";
const PREFIX = "!";
const intervals = new Map();

client.once("ready", () => {
  console.log("🤖 Bot Ready");
});

async function sendRandom(channel, username) {
  const res = await axios.get(`${API}?user=${username}`);
  const s = res.data;

  const embed = new EmbedBuilder()
    .setTitle(s.title)
    .setDescription(s.description || "بدون وصف")
    .setImage(s.image)
    .setColor("#00ffff")
    .setFooter({ text: "KRB Auto Scripts" });

  await channel.send({ embeds: [embed] });
  await channel.send(`📜 \`${s.rawScript}\``);
}

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return;

  if (msg.content === "!ابدا") {
    if (intervals.has(msg.channel.id)) {
      return msg.reply("⏱ الإرسال شغال بالفعل");
    }

    await sendRandom(msg.channel, msg.author.username);

    const int = setInterval(() => {
      sendRandom(msg.channel, msg.author.username);
    }, 20 * 60 * 1000);

    intervals.set(msg.channel.id, int);
    msg.reply("🚀 بدأ الإرسال التلقائي كل 20 دقيقة");
  }

  if (msg.content === "!ايقاف") {
    clearInterval(intervals.get(msg.channel.id));
    intervals.delete(msg.channel.id);
    msg.reply("🛑 تم الإيقاف");
  }
});

client.login(process.env.BOT_TOKEN);
