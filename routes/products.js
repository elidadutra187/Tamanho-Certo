const { Router } = require("express");
const NuvemshopClient = require("../services/nuvemshop");
const { readStoreSession } = require("../services/session");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const client = await NuvemshopClient.fromStore(readStoreSession(req));
    const products = await client.listProducts({
      page: req.query.page || 1,
      perPage: Math.min(Number(req.query.per_page || 30), 100),
      q: req.query.q || ""
    });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
