require('dotenv').config()
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/", async (req, res) => {
  const { query } = req.query;
  const searchUrl = `https://www.amazon.com/s?k=${query}`;
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto(searchUrl);
  try {
    const data = await page.evaluate(() => {
      const items = [
        ...document.querySelectorAll(
          ".s-result-list.s-search-results.sg-row>div"
        )
      ];
      return items
        .map(item => {
          if (!item.querySelector(".a-color-base.a-text-normal")) {
            return;
          }
          const title = item.querySelector(".a-color-base.a-text-normal")
            .innerText;
          const url = item
            .querySelector(".a-link-normal.a-text-normal")
            .getAttribute("href");
          const temp =
            item.querySelector(".a-row.a-size-small") &&
            item
              .querySelector(".a-row.a-size-small")
              .querySelectorAll("span[aria-label]");
          let stars, num_reviews;
          if (temp) {
            stars = parseFloat(temp[0].getAttribute("aria-label"));
            num_reviews = temp[1].getAttribute("aria-label");
          }

          const price =
            item.querySelector(".a-price") &&
            item.querySelector(".a-price>.a-offscreen").innerText;

          const image = item.querySelector("img").getAttribute("src");

          return {
            title,
            product_id: url,
            stars,
            num_reviews,
            price,
            image
          };
        })
        .filter(Boolean);
    });

    res.json(data);
  } catch (err) {
    res.json(err);
  }
});

app.listen(process.env.PORT);

// newObj.title = el.title;
// newObj.image = el.image;
// newObj.price = el.price;
// newObj.num_reviews = el.num_reviews;
// newObj.stars = el.stars;
// newObj.product_id = el.product_id;
