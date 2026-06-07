const express = require("express");
const { findGuideByProduct } = require("../services/guideService");

const router = express.Router();

router.get("/config", async (req, res, next) => {
  try {
    const guide = await findGuideByProduct({
    name: req.query.product_name,
    category: req.query.category,
    productType: req.query.product_type,
    tags: req.query.tags
  });

    res.json({
      appName: "Tamanho Certo",
      guide
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
