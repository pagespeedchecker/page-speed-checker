const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.PAGESPEED_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/analyze", async (req, res) => {
  try {
    let { url, strategy } = req.body;
    if (!url) return res.status(400).json({ error: "Please enter a website URL." });

    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    new URL(url);

    if (!API_KEY || API_KEY === "YOUR_GOOGLE_PAGESPEED_API_KEY") {
      return res.status(500).json({
        error: "PageSpeed API key is not configured. Add PAGESPEED_API_KEY to your environment."
      });
    }

    const endpoint =
      "https://www.googleapis.com/pagespeedonline/v5/runPagespeed" +
      `?url=${encodeURIComponent(url)}` +
      `&strategy=${strategy === "desktop" ? "desktop" : "mobile"}` +
      `&category=performance&category=seo&category=accessibility&category=best-practices` +
      `&key=${encodeURIComponent(API_KEY)}`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "PageSpeed API request failed."
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to analyze this URL." });
  }
});

app.listen(PORT, () => {
  console.log(`Page Speed Checker running at http://localhost:${PORT}`);
});
