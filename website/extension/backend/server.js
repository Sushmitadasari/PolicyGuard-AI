require("dotenv").config();

const express = require("express");
const cors = require("cors");

const analyzeRoutes = require(
  "./routes/analyzeRoutes"
);

const app = express();

app.use(cors());

app.use(express.json({
  limit: "10mb",
}));

app.use(
  "/api/analyze",
  analyzeRoutes
);

app.get("/", (req, res) => {
  res.json({
    message:
      "POLICYGUARD AI Backend Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});