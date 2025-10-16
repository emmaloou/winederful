import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api", ts: new Date().toISOString() });
});

// TODO: add your real routes here, e.g.
// app.use("/v1/products", productsRouter);

app.listen(PORT, () => {
  console.log(`[api] listening on :${PORT}`);
});