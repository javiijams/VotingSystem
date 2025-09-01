import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("CATSU-iVote API running ✅");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
