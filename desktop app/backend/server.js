const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

function calculateRisk(permissions) {
  let score = 0;

  permissions.forEach((p) => {
    if (p === "camera") score += 3;
    if (p === "microphone") score += 3;
    if (p === "location") score += 2;
    if (p === "contacts") score += 3;
    if (p === "storage") score += 1;
  });

  let risk = "Low";

  if (score >= 4) risk = "Medium";
  if (score >= 7) risk = "High";

  return { score, risk };
}

function recommendation(risk) {
  if (risk === "High") return "Uninstall or restrict permissions";
  if (risk === "Medium") return "Limit permissions";
  return "Safe";
}

app.post("/analyze", (req, res) => {
  const { app: appName, permissions } = req.body;

  const result = calculateRisk(permissions);

  res.json({
    app: appName,
    permissions,
    score: result.score,
    risk: result.risk,
    recommendation: recommendation(result.risk)
  });
});

app.listen(5000, () => {
  console.log("Backend running on 5000");
});