import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*", // allow all (Netlify + Railway)
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use("/api", router);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
