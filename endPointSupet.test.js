/** @format */

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
   res.json({ message: "Products fetched successfully", products: [] });
});

module.exports = router;

const express = require("express");
const app = express();
const productsRoute = require("./routes/products");

app.use("/products", productsRoute);

module.exports = app;

const request = require("supertest");
const app = require("../../src/app");

describe("GET /products", () => {
   it("should fetch all products", async () => {
      const res = await request(app).get("/products");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Products fetched successfully");
      expect(res.body.products).toEqual([]);
   });
});
