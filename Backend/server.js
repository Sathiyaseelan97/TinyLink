import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/route.js";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend URL
    credentials: true, // allow cookies/credentials
  })
);
app.use(bodyParser.json());

// Mount API router at /api
app.use("/api", router);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
