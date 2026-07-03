import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import RSS from "rss";

const app = express();

const SOURCE =
  "https://theanalyst.com/competition/football/articles";

app.get("/", (req, res) => {
  res.send("The Analyst RSS Generator is running.");
});

app.get("/rss", async (req, res) => {
  try {
    const { data } = await axios.get(SOURCE, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137 Safari/537.36"
      }
    });

    const $ = cheerio.load(data);

    const feed = new RSS({
      title: "The Analyst Football",
      description: "Latest Football Articles",
      feed_url: `${req.protocol}://${req.get("host")}/rss`,
      site_url: SOURCE,
      language: "en"
    });

    res.set("Content-Type", "application/xml");
    res.send(feed.xml({ indent: true }));

  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("RSS Server Started");
});
