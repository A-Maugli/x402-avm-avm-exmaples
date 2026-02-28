import { config } from "dotenv";
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402-avm/express";
import { ExactAvmScheme } from "@x402-avm/avm/exact/server";
import { HTTPFacilitatorClient } from "@x402-avm/core/server";
import { ALGORAND_TESTNET_CAIP2 } from "@x402-avm/avm";
config();

const avmAddress = process.env.AVM_ADDRESS;
if (!avmAddress) {
  console.error("❌ Missing required environment variable AVM_ADDRESS");
  process.exit(1);
}

const facilitatorUrl = process.env.FACILITATOR_URL;
if (!facilitatorUrl) {
  console.error("❌ Missing required environment variable FACILITATOR_URL");
  process.exit(1);
}
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });

const app = express();

app.use(
  paymentMiddleware(
    {
      "GET /weather_paid": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: ALGORAND_TESTNET_CAIP2,
            payTo: avmAddress,
          },
        ],
        description: "Weather data",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(facilitatorClient)
      .register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme()),
  ),
);

app.get("/weather_paid", (req, res) => {
  res.send({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});

app.get("/weather_free", (req, res) => {
  res.send({
    report: {
      weather: "rainy",
      temperature: 50,
    },
  });
});

app.get("/", (req, res) => {
  res.send("Request weather data at /weather_free  or /weather_paid");
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:${4021}`);
});
