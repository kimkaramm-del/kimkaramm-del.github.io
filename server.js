const express = require("express");
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// عرض الموقع (index.html)
app.use(express.static(__dirname));

// 🔴 حط التوكن تبعك هون
const TOKEN = "8582965858:AAFfRoKBqJ1-VoW_F6CSS7GE988dISGicYI";

const bot = new TelegramBot(TOKEN, { polling: true });

let products = [];

// تحميل المنتجات
if (fs.existsSync("data.json")) {
  products = JSON.parse(fs.readFileSync("data.json"));
}

// 📸 إضافة منتج مع صورة
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;

  try {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(fileId);

    const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

    bot.sendMessage(chatId, "✍️ ابعت التفاصيل:\nname | desc | price | category");

    bot.once("message", (reply) => {
      if (!reply.text) return;

      const parts = reply.text.split("|");

      if (parts.length < 4) {
        bot.sendMessage(chatId, "❌ صيغة غلط");
        return;
      }

      const product = {
        id: Date.now(),
        image: imageUrl,
        title: parts[0].trim(),
        desc: parts[1].trim(),
        price: parts[2].trim(),
        category: parts[3].trim()
      };

      products.push(product);
      fs.writeFileSync("data.json", JSON.stringify(products, null, 2));

      bot.sendMessage(chatId, "✅ تم إضافة المنتج");
    });

  } catch (err) {
    console.log(err);
    bot.sendMessage(chatId, "❌ صار خطأ");
  }
});

// 📋 عرض المنتجات
bot.onText(/\/list/, (msg) => {
  if (products.length === 0) {
    bot.sendMessage(msg.chat.id, "❌ لا يوجد منتجات");
    return;
  }

  let text = "📦 المنتجات:\n\n";

  products.forEach(p => {
    text += `ID: ${p.id}\n${p.title} - ${p.price}\n\n`;
  });

  bot.sendMessage(msg.chat.id, text);
});

// 🗑️ حذف منتج
bot.onText(/\/delete (.+)/, (msg, match) => {
  const id = parseInt(match[1]);

  products = products.filter(p => p.id !== id);
  fs.writeFileSync("data.json", JSON.stringify(products, null, 2));

  bot.sendMessage(msg.chat.id, "🗑️ تم الحذف");
});

// 🌐 API للموقع
app.get("/products", (req, res) => {
  res.json(products);
});

// 🚀 تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});