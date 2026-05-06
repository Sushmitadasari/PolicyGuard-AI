const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("PolicyGuard AI Backend Running");
});

app.post("/analyze", (req, res) => {

    const text = req.body.text;

    res.json({
        summary: "This policy collects user data and shares with third parties.",
        riskScore: 7,
        riskLevel: "High",
        risks: ["Data sharing", "Auto renewal"]
    });
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});