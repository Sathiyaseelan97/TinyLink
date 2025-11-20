import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/route.js";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
