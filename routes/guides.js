const express = require("express");
const { readStoreSession } = require("../services/session");
const { findGuideByProduct, getGuide, getStats, listGuides, logRecommendation, saveGuide } = require("../services/guideService");
const { recommendSize } = require("../services/recommendation");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json({ guides: await listGuides(readStoreSession(req)) });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    res.json({ stats: await getStats(readStoreSession(req)) });
  } catch (error) {
    next(error);
  }
});

router.post("/match", async (req, res, next) => {
  try {
    const guide = await findGuideByProduct(req.body.product || {}, readStoreSession(req));
    res.json({ guide });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const guide = await saveGuide(req.body.guide, readStoreSession(req));
    res.status(201).json({ guide });
  } catch (error) {
    next(error);
  }
});

router.post("/:guideId/recommend", async (req, res, next) => {
  try {
    const storeId = readStoreSession(req);
    const guide = await getGuide(req.params.guideId, storeId);
    if (!guide) {
      return res.status(404).json({ error: "Guia nao encontrado" });
    }

    const recommendation = recommendSize(guide, req.body.answers || {});
    await logRecommendation({
      storeId,
      guideId: guide.id,
      productId: req.body.product?.id,
      productName: req.body.product?.name,
      recommendedSize: recommendation.size,
      confidence: recommendation.confidence,
      answers: req.body.answers
    });
    res.json({ recommendation });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
