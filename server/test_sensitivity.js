const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:5001/api/ai/sensitivity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropName: "Wheat",
        regionName: "Test Region",
        variations: { price: -15, yield: 0, cost: 0 },
        baseProfit: 10000,
        adjustedProfit: 8500,
        baseRoi: 20,
        adjustedRoi: 15
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  }
}
test();
