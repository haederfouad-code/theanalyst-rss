import * as cheerio from "cheerio";

const URL = "https://theanalyst.com/competition/football/articles";

export default async function handler(req, res) {
  try {
    const response = await fetch(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    const items = [];

    $("article.pg-card").each((i, el) => {

      const title = $(el)
        .find(".pg-card__title a")
        .text()
        .trim();

      const href = $(el)
        .find(".pg-card__title a")
        .attr("href");

      if (!title || !href) return;

      const link = href.startsWith("http")
        ? href
        : "https://theanalyst.com" + href;

      const image =
        $(el).find("img").attr("src") ||
        $(el).find("img").attr("data-src") ||
        "";

      const description = $(el)
        .find(".pg-card__summary")
        .text()
        .trim();

      const author = $(el)
        .find(".pg-card__author")
        .text()
        .trim();

      const date =
        $(el).find("time").attr("datetime") ||
        new Date().toUTCString();

      items.push({
        title,
        link,
        image,
        description,
        author,
        date
      });

    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
xmlns:media="http://search.yahoo.com/mrss/">

<channel>

<title>The Analyst Football RSS</title>

<link>${URL}</link>

<description>Latest Football Articles</description>

<language>en</language>

<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

    items.forEach(item => {

      xml += `
<item>

<title><![CDATA[${item.title}]]></title>

<link>${item.link}</link>

<guid>${item.link}</guid>

<description><![CDATA[
<img src="${item.image}" /><br/>
${item.description}
]]></description>

<author><![CDATA[${item.author}]]></author>

<pubDate>${item.date}</pubDate>

<media:content
url="${item.image}"
medium="image"/>

</item>
`;

    });

    xml += `
</channel>

</rss>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xml);

  } catch (err) {

    res.status(500).send(err.stack);

  }
}
