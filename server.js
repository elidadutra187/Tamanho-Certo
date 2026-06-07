require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const guidesRouter = require("./routes/guides");
const widgetRouter = require("./routes/widget");
const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const { initializeDatabase } = require("./services/database");
const { logger } = require("./utils/logger");

const app = express();
const port = process.env.PORT || 3001;

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "privacy.html"));
});

app.get("/support", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "support.html"));
});

app.use("/api/guides", guidesRouter);
app.use("/api/widget", widgetRouter);
app.use("/auth", authRouter);
app.use("/api/products", productsRouter);

app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || "Erro interno"
  });
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      logger.info(`Tamanho Certo rodando na porta ${port}`);
    });
  })
  .catch((error) => {
    logger.error(`Erro ao inicializar banco: ${error.message}`);
    process.exit(1);
  });
