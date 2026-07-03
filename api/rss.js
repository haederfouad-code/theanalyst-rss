import axios from "axios";
import cheerio from "cheerio";

const URL = "https://theanalyst.com/competition/football/articles";

export default async function handler(req, res) {
  try {
    const { data } = await axios.get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const $ = cheerio.load(data);

    const items = [];

    $("article").each((i, el) => {

      const title = $(el)
        .find(".pg-card__title a")
        .text()
        .trim();

      const link = $(el)
        .find(".pg-card__title a")
        .attr("href");

      const image =
        $(el)
          .find("img")
          .attr("src") ||
        "";

      const description = $(el)
        .find(".pg-card__summary")
        .text()
        .trim();

      const author = $(el)
        .find(".pg-card__author")
        .text()
        .trim();

      const date = $(el)
        .find("time")
        .attr("datetime");

      if (title && link) {

        items.push({
          title,
          link: link.startsWith("http")
            ? link
            : "https://theanalyst.com" + link,
          image,
          description,
          author,
          date
        });

      }

    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
xmlns:media="http://search.yahoo.com/mrss/">

<channel>

<title>The Analyst Football</title>

<link>${URL}</link>

<description>Latest Football Articles</description>
`;

    items.forEach(item => {

      xml += `
<item>

<title><![CDATA[${item.title}]]></title>

<link>${item.link}</link>

<description><![CDATA[
<img src="${item.image}" /><br>
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

</rss>
`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);

  } catch (e) {

    res.status(500).send(e.message);

  }
}
