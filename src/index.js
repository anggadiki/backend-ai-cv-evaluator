import express from "express";
import bodyParser from "body-parser";
import uploadRouter from "./routes/upload.js";
import evaluateRouter from "./routes/evaluate.js";
import resultRouter from "./routes/result.js";
import candidateRoutes from "./routes/candidate.js";
import { initRag } from "./services/ragService.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());
await initRag();

app.use("/upload", uploadRouter);
app.use("/evaluate", evaluateRouter);
app.use("/result", resultRouter);
app.use("/candidate", candidateRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
