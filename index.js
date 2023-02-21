import express from "express";
import fetch from "node-fetch";
const app = express();
const port = 3000;

const api_url = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
const response = await fetch(api_url);
const data = await response.json();

app.get("/statistics/:month", (req, res) => {
  const { month } = req.params;

  const totalsales = data.reduce((acc, dataa) => {
    if (dataa.sold && dataa.dateOfSale.startsWith(month, 4)) {
      return acc + dataa.price;
    }
    return acc;
  }, 0);

  const totalsold = data.reduce((total, curr) => {
    if (curr.sold && curr.dateOfSale.startsWith(month, 5)) {
      return total + 1;
    }
    return total;
  }, 0);

  const notSold = data.reduce((total, curr) => {
    if (!curr.sold && curr.dateOfSale.startsWith(month, 5)) {
      return total + 1;
    }
    return total;
  }, 0);

  res.json({
    totalsales,
    totalsold,
    notSold,
  });
});

app.get("/barchart/:month", (req, res) => {
  const { month } = req.params;
  const priceRange = {
    "0-100": 0,
    "101-200": 0,
    "201-300": 0,
    "301-400": 0,
    "401-500": 0,
    "501-600": 0,
    "601-700": 0,
    "701-800": 0,
    "801-900": 0,
    "901-above": 0,
  };

  data.forEach((val) => {
    if (val.dateOfSale.startsWith(month, 5)) {
      if (val.price >= 0 && val.price <= 100) {
        priceRange["0-100"]++;
      } else if (val.price >= 101 && val.price <= 200) {
        priceRange["101-200"]++;
      } else if (val.price >= 201 && val.price <= 300) {
        priceRange["201-300"]++;
      } else if (val.price >= 301 && val.price <= 400) {
        priceRange["301-400"]++;
      } else if (val.price >= 401 && val.price <= 500) {
        priceRange["401-500"]++;
      } else if (val.price >= 501 && val.price <= 600) {
        priceRange["501-600"]++;
      } else if (val.price >= 601 && val.price <= 700) {
        priceRange["601-700"]++;
      } else if (val.price >= 701 && val.price <= 800) {
        priceRange["701-800"]++;
      } else if (val.price >= 801 && val.price <= 900) {
        priceRange["801-900"]++;
      } else if (val.price >= 901) {
        priceRange["901-above"]++;
      }
    }
  });

  res.json(priceRange);
});

app.get("/piechart/:month", (req, res) => {
  const { month } = req.params;
  const category = data.reduce((acc, val) => {
    if (val.dateOfSale.startsWith(month, 5)) {
      acc[val.category] =
        acc[val.category] === undefined ? 1 : (acc[val.category] += 1);
      return acc;
    }
    return acc;
  }, {});
  res.json({
    category,
  });
});
app.get("/combined/:month", async (req, res) => {
  const { month } = req.params;

  const [statistics, barchart, piechart] = await Promise.all([
    fetch(`http://localhost:3000/statistics/${month}`).then((res) =>
      res.json()
    ),
    fetch(`http://localhost:3000/barchart/${month}`).then((res) => res.json()),
    fetch(`http://localhost:3000/piechart/${month}`).then((res) => res.json()),
  ]);

  res.json({
    statistics,
    barchart,
    piechart,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
