const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse form data

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

const ItemSchema = new mongoose.Schema({
  image: { type: String, required: true },
  download: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

const Item = mongoose.model("Item", ItemSchema);

// GET API - Fetch all items
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST API - Add new item (for API clients)
app.post("/api/items", async (req, res) => {
  try {
    const { image, download, name } = req.body;

    if (!image || !download || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newItem = new Item({ image, download, name });
    await newItem.save();

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add item" });
  }
});

// === NEW ===
// Render HTML form for uploading items
app.get("/upload", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Upload Movie</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; }
        label { display: block; margin-top: 15px; }
        input[type=text] { width: 100%; padding: 8px; }
        button { margin-top: 20px; padding: 10px 15px; font-size: 16px; }
      </style>
    </head>
    <body>
      <h1>Upload Movie Info</h1>
      <form method="POST" action="/upload">
        <label>Image URL:</label>
        <input type="text" name="image" required placeholder="https://example.com/image.jpg" />

        <label>Download URL:</label>
        <input type="text" name="download" required placeholder="https://example.com/movie.mp4" />

        <label>Movie Name:</label>
        <input type="text" name="name" required placeholder="Movie title" />

        <button type="submit">Upload</button>
      </form>
    </body>
    </html>
  `);
});

// Handle form submission from HTML page
app.post("/upload", async (req, res) => {
  try {
    const { image, download, name } = req.body;
    if (!image || !download || !name) {
      return res.send("All fields are required. <a href='/upload'>Try again</a>");
    }

    const newItem = new Item({ image, download, name });
    await newItem.save();

    res.send(`Movie uploaded successfully! <a href="/upload">Upload another</a>`);
  } catch (err) {
    res.status(500).send("Failed to upload movie. <a href='/upload'>Try again</a>");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
