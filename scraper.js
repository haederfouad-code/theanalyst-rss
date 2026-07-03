import axios from "axios";
import cheerio from "cheerio";

const URL = "https://theanalyst.com/competition/football/articles";

export async function getArticles() {
  const { data } = await axios.get(URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137 Safari/537.36"
    }
  });

  const $ = cheerio.load(data);

  const articles = [];

  $("article").each((i, el) => {

    const title =
      $(el).find("h2,h3").first().text().trim();

    const link =
      $(el).find("a").first().attr("href");

    const image =
      $(el).find("img").first().attr("src") ||
      $(el).find("img").first().attr("data-src");

    const description =
      $(el).find("p").first().text().trim();

    const date =
      $(el).find("time").attr("datetime") ||
      "";

    if (title && link) {
      articles.push({
        title,
        link: link.startsWith("http")
          ? link
          : "https://theanalyst.com" + link,
        image,
        description,
        date
      });
    }

  });

  return articles;
}
