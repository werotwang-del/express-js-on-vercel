import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Home route - HTML
app.get("/", (req, res) => {
    res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `);
});

app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "components", "about.htm"));
});

// Example API endpoint - JSON
app.get("/api-data", (req, res) => {
    res.json({
        message: "Here is some sample API data",
        items: ["apple", "banana", "cherry"],
    });
});

const baseHost = "https://my-api.werotwang.workers.dev";

app.get("/api/feedbacks", async (req, res) => {
    let result = await fetch(`${baseHost}/api/feedbacks`);
    result = await result.json();
    console.log("112222");
    return result;
});

app.get("/api/tags", async (req, res) => {
    let result = await fetch(`https://files-under-healing-wiring.trycloudflare.com/api/front/tags`);
    result = await result.json();
    return result;
});

// Health check
app.get("/healthz", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
