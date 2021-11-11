const express = require("express");
const app = express();
const { Pool } = require("pg");

const connection = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_ecommerce",
  password: "Migracode",
  port: "5432",
});
app.get("/customers", (req, res) => {
  connection.query("select * from customers", (error, result) => {
    res.json(result.rows);
  });
});
app.get("/suppliers", (req, res) => {
  connection.query("select * from suppliers", (error, result) => {
    res.json(result.rows);
  });
});
app.get("/products", (req, res) => {
  connection.query("select * from products", (error, result) => {
    res.json(result.rows);
  });
});
app.get("/orders", (req, res) => {
  connection.query("select * from orders", (error, result) => {
    res.json(result.rows);
  });
});
app.get("/order_items", (req, res) => {
  connection.query("select * from order_items", (error, result) => {
    res.json(result.rows);
  });
});

const port = 4000;
app.listen(port, () =>
  console.log(`Server is listening on ${port}. Ready to accept requests!`)
);
