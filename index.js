import express from "express";
import "dotenv/config";

const server = express();
server.use(express.json());

const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL;

/* ---------- Math Utilities ---------- */

const checkPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const findGCD = (x, y) => {
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
};

const findLCM = (x, y) => (x * y) / findGCD(x, y);

/* ---------- Helpers ---------- */

const generateFibonacci = (n) => {
  const series = [];
  for (let i = 0; i < n; i++) {
    series.push(i < 2 ? i : series[i - 1] + series[i - 2]);
  }
  return series;
};

const processArray = (arr, operation) => {
  return arr.reduce((acc, curr) => operation(acc, curr));
};

/* ---------- Routes ---------- */

server.get("/health", (_, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

server.post("/bfhl", async (req, res) => {
  try {
    const payload = req.body;
    const requestType = Object.keys(payload);

    if (requestType.length !== 1) {
      return res.status(400).json({ is_success: false });
    }

    const key = requestType[0];
    let output;

    switch (key) {
      case "fibonacci":
        output = generateFibonacci(payload.fibonacci);
        break;

      case "prime":
        output = payload.prime.filter(checkPrime);
        break;

      case "lcm":
        output = processArray(payload.lcm, findLCM);
        break;

      case "hcf":
        output = processArray(payload.hcf, findGCD);
        break;

      case "AI": {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `Answer in one word only. ${payload.AI}` }
                  ]
                }
              ]
            })
          }
        );

        const aiData = await geminiResponse.json();
        output =
          aiData?.candidates?.[0]?.content?.parts?.[0]?.text?.split(" ")[0];
        break;
      }

      default:
        return res.status(400).json({ is_success: false });
    }

    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: output
    });

  } catch (error) {
    res.status(500).json({ is_success: false });
  }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
