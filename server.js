const express = require("express");
const fs = require("fs");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

/*
🔴 حط التوكن تبعك بين " "
مثال:
const TOKEN = "123456:ABC...";
*/
const TOKEN = "8582965858:AAFfRoKBqJ1-VoW_F6CSS7GE988dISGicYI";

const bot = new TelegramBot(TOKEN, { polling: true });

const DATA_FILE = path.join(__dirname, "data.json");

let products = [];

// تحميل البيانات
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    products = raw ? JSON.parse(raw) : [];
  }
} catch (err) {
  console.log("Error loading data:", err);
  products = [];
}

// حفظ البيانات
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// استقبال من تلغرام
bot.on("message", (msg) => {
  try {
    let text = msg.text || msg.caption;
    if (!text) return;

    // الصيغة المطلوبة
    // name | desc | price | category
    let parts = text.split("|");

    if (parts.length < 4) {
      bot.sendMessage(
        msg.chat.id,
        "❌ اكتب:\nname | desc | price | category"
      );
      return;
    }

    let image = "https://via.placeholder.com/300";

    // إذا المستخدم أرسل صورة
    if (msg.photo) {
      image = msg.photo[msg.photo.length - 1].file_id;
    }

    let product = {
      id: Date.now(),
      image: image,
      title: parts[0].trim(),
      desc: parts[1].trim(),
      price: parts[2].trim(),
      category: parts[3].trim().toLowerCase()
    };

    products.push(product);
    saveData();

    bot.sendMessage(msg.chat.id, "✅ تم إضافة المنتج 🔥");

  } catch (err) {
    console.log("Bot error:", err);
  }
});

// API للموقع
app.get("/products", (req, res) => {
  res.json(products);
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🔥`);
});
