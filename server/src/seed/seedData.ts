import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import Crop from "../models/Crop";
import Region from "../models/Region";
import Category from "../models/Category";
import State from "../models/State";
import Irrigation from "../models/Irrigation";
import CostParameter from "../models/CostParameter";

// Helper to generate 7-day forecast
const genForecast = (baseTemp: number, baseRain: number) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const conditions = [
    "Sunny",
    "Partly Cloudy",
    "Cloudy",
    "Light Rain",
    "Heavy Rain",
    "Thunderstorm",
  ];
  return days.map((d) => ({
    day: d,
    tempC: baseTemp + Math.round((Math.random() - 0.5) * 8),
    rainfallMM: Math.round(baseRain * (0.3 + Math.random() * 1.4)),
    condition: conditions[Math.floor(Math.random() * conditions.length)],
  }));
};

const states = [
  { name: "Punjab", code: "PB" },
  { name: "Maharashtra", code: "MH" },
  { name: "Bihar", code: "BR" },
  { name: "Kerala", code: "KL" },
  { name: "Gujarat", code: "GJ" },
  { name: "Karnataka", code: "KA" },
];

const categories = [
  { name: "Cereals", description: "Essential food grains like Wheat and Rice" },
  {
    name: "Cash Crops",
    description: "High-value crops like Cotton and Sugarcane",
  },
  {
    name: "Oilseeds",
    description: "Crops grown for oil extraction like Soybean and Mustard",
  },
  { name: "Horticulture", description: "Fruits, vegetables and flowers" },
  { name: "Spices", description: "Aromatic crops like Turmeric and Chilli" },
  { name: "Pulses", description: "Protein-rich legumes" },
];

const irrigations = [
  {
    typeName: "Drip",
    description: "Most efficient, targets roots directly",
    efficiencyRating: "High",
    costPerAcre: 5000,
  },
  {
    typeName: "Sprinkler",
    description: "Simulates rain, good for slopes",
    efficiencyRating: "High",
    costPerAcre: 3500,
  },
  {
    typeName: "Canal",
    description: "Traditional river-based irrigation",
    efficiencyRating: "Medium",
    costPerAcre: 1000,
  },
  {
    typeName: "Borewell",
    description: "Groundwater-based irrigation",
    efficiencyRating: "Medium",
    costPerAcre: 2000,
  },
  {
    typeName: "Rainfed",
    description: "Completely dependent on natural rainfall",
    efficiencyRating: "Low",
    costPerAcre: 0,
  },
];

const costs = [
  { name: "Seeds", defaultUnit: "kg", category: "Input" },
  { name: "Fertilizer", defaultUnit: "kg", category: "Input" },
  { name: "Pesticide", defaultUnit: "L", category: "Input" },
  { name: "Labor", defaultUnit: "man-days", category: "Labor" },
  { name: "Transport", defaultUnit: "trip", category: "Logistics" },
  { name: "Misc", defaultUnit: "units", category: "Miscellaneous" },
];

const crops = [
  {
    name: "Rice (Paddy)",
    category: "Cereals",
    baseYieldPerAcre: 22,
    growthDurationDays: 120,
    waterRequirement: "High",
    waterRequirementMM: 1200,
    mspPerQuintal: 2300,
    marketPricePerQuintal: 2550,
    mandiPrice: 2480,
    onlinePrice: 2620,
    marketDemand: "High",
    defaultCosts: {
      seeds: 1500,
      fertilizer: 4000,
      pesticide: 2000,
      labor: 6000,
      irrigation: 3500,
      transport: 1000,
      misc: 1200,
    },
    mspHistory: [
      { year: 2021, msp: 1940 },
      { year: 2022, msp: 2040 },
      { year: 2023, msp: 2183 },
      { year: 2024, msp: 2300 },
    ],
    pestRules: [
      {
        name: "Blast Disease",
        probability: 35,
        severity: "High",
        season: "Kharif",
        description: "Fungal lesions on leaves.",
      },
    ],
    soilSuitability: {
      Alluvial: 95,
      "Black Cotton Soil": 70,
      "Red Laterite": 60,
    },
    temperatureRange: { min: 22, max: 35 },
  },
  {
    name: "Wheat",
    category: "Cereals",
    baseYieldPerAcre: 20,
    growthDurationDays: 135,
    waterRequirement: "Medium",
    waterRequirementMM: 450,
    mspPerQuintal: 2275,
    marketPricePerQuintal: 2600,
    mandiPrice: 2500,
    onlinePrice: 2700,
    marketDemand: "High",
    defaultCosts: {
      seeds: 1200,
      fertilizer: 3500,
      pesticide: 1500,
      labor: 4500,
      irrigation: 3000,
      transport: 800,
      misc: 1000,
    },
    mspHistory: [
      { year: 2021, msp: 1975 },
      { year: 2022, msp: 2015 },
      { year: 2023, msp: 2125 },
      { year: 2024, msp: 2275 },
    ],
    pestRules: [
      {
        name: "Yellow Rust",
        probability: 30,
        severity: "High",
        season: "Rabi",
        description: "Yellow stripe patches on leaves.",
      },
    ],
    soilSuitability: {
      Alluvial: 90,
      "Black Cotton Soil": 75,
      "Red Laterite": 50,
    },
    temperatureRange: { min: 10, max: 25 },
  },
  {
    name: "Cotton",
    category: "Cash Crops",
    baseYieldPerAcre: 8,
    growthDurationDays: 180,
    waterRequirement: "High",
    waterRequirementMM: 700,
    mspPerQuintal: 7121,
    marketPricePerQuintal: 7800,
    mandiPrice: 7500,
    onlinePrice: 8200,
    marketDemand: "High",
    defaultCosts: {
      seeds: 2500,
      fertilizer: 4500,
      pesticide: 3500,
      labor: 7000,
      irrigation: 4000,
      transport: 1200,
      misc: 1500,
    },
    mspHistory: [
      { year: 2021, msp: 5726 },
      { year: 2022, msp: 6080 },
      { year: 2023, msp: 6620 },
      { year: 2024, msp: 7121 },
    ],
    pestRules: [
      {
        name: "Pink Bollworm",
        probability: 55,
        severity: "High",
        season: "Kharif",
        description: "Damages bolls, reduces lint quality.",
      },
    ],
    soilSuitability: {
      "Black Cotton Soil": 95,
      Alluvial: 60,
      "Red Laterite": 50,
    },
    temperatureRange: { min: 21, max: 38 },
  },
  {
    name: "Sugarcane",
    category: "Cash Crops",
    baseYieldPerAcre: 350,
    growthDurationDays: 365,
    waterRequirement: "High",
    waterRequirementMM: 1800,
    mspPerQuintal: 340,
    marketPricePerQuintal: 380,
    mandiPrice: 360,
    onlinePrice: 400,
    marketDemand: "High",
    defaultCosts: {
      seeds: 6000,
      fertilizer: 6000,
      pesticide: 2500,
      labor: 10000,
      irrigation: 5000,
      transport: 2500,
      misc: 2000,
    },
    mspHistory: [
      { year: 2021, msp: 290 },
      { year: 2022, msp: 305 },
      { year: 2023, msp: 315 },
      { year: 2024, msp: 340 },
    ],
    soilSuitability: {
      Alluvial: 85,
      "Black Cotton Soil": 80,
      "Alluvial (Delta)": 90,
    },
    temperatureRange: { min: 20, max: 40 },
  },
  {
    name: "Soybean",
    category: "Oilseeds",
    baseYieldPerAcre: 10,
    growthDurationDays: 100,
    waterRequirement: "Low",
    waterRequirementMM: 400,
    mspPerQuintal: 4892,
    marketPricePerQuintal: 5400,
    mandiPrice: 5200,
    onlinePrice: 5600,
    marketDemand: "Medium",
    defaultCosts: {
      seeds: 1800,
      fertilizer: 3000,
      pesticide: 1500,
      labor: 4000,
      irrigation: 1500,
      transport: 800,
      misc: 1000,
    },
    mspHistory: [
      { year: 2021, msp: 3950 },
      { year: 2022, msp: 4300 },
      { year: 2023, msp: 4600 },
      { year: 2024, msp: 4892 },
    ],
    soilSuitability: {
      "Black Cotton Soil": 90,
      Alluvial: 75,
      "Red Laterite": 60,
    },
    temperatureRange: { min: 20, max: 35 },
  },
  {
    name: "Maize",
    category: "Cereals",
    baseYieldPerAcre: 22,
    growthDurationDays: 110,
    waterRequirement: "Medium",
    waterRequirementMM: 500,
    mspPerQuintal: 2225,
    marketPricePerQuintal: 2450,
    mandiPrice: 2350,
    onlinePrice: 2550,
    marketDemand: "High",
    defaultCosts: {
      seeds: 1000,
      fertilizer: 3000,
      pesticide: 1200,
      labor: 4000,
      irrigation: 2500,
      transport: 700,
      misc: 800,
    },
    mspHistory: [
      { year: 2021, msp: 1870 },
      { year: 2022, msp: 1962 },
      { year: 2023, msp: 2090 },
      { year: 2024, msp: 2225 },
    ],
    soilSuitability: {
      Alluvial: 85,
      "Black Cotton Soil": 80,
      "Red Laterite": 65,
    },
    temperatureRange: { min: 18, max: 35 },
  },
  {
    name: "Tomato",
    category: "Horticulture",
    baseYieldPerAcre: 95,
    growthDurationDays: 110,
    waterRequirement: "Medium",
    waterRequirementMM: 600,
    mspPerQuintal: 1200,
    marketPricePerQuintal: 1600,
    mandiPrice: 1450,
    onlinePrice: 1720,
    marketDemand: "High",
    defaultCosts: {
      seeds: 4200,
      fertilizer: 5200,
      pesticide: 3600,
      labor: 9000,
      irrigation: 3800,
      transport: 1800,
      misc: 1600,
    },
    mspHistory: [
      { year: 2021, msp: 980 },
      { year: 2022, msp: 1040 },
      { year: 2023, msp: 1120 },
      { year: 2024, msp: 1200 },
    ],
    soilSuitability: {
      Alluvial: 88,
      "Black Cotton Soil": 82,
      "Red Laterite": 75,
    },
    temperatureRange: { min: 18, max: 32 },
  },
  {
    name: "Onion",
    category: "Horticulture",
    baseYieldPerAcre: 70,
    growthDurationDays: 120,
    waterRequirement: "Medium",
    waterRequirementMM: 520,
    mspPerQuintal: 1450,
    marketPricePerQuintal: 1900,
    mandiPrice: 1760,
    onlinePrice: 2050,
    marketDemand: "High",
    defaultCosts: {
      seeds: 3000,
      fertilizer: 4200,
      pesticide: 2600,
      labor: 8200,
      irrigation: 2800,
      transport: 1700,
      misc: 1200,
    },
    mspHistory: [
      { year: 2021, msp: 1200 },
      { year: 2022, msp: 1280 },
      { year: 2023, msp: 1380 },
      { year: 2024, msp: 1450 },
    ],
    soilSuitability: {
      Alluvial: 86,
      "Black Cotton Soil": 78,
      "Red Laterite": 72,
    },
    temperatureRange: { min: 15, max: 30 },
  },
  {
    name: "Strawberry",
    category: "Horticulture",
    baseYieldPerAcre: 36,
    growthDurationDays: 145,
    waterRequirement: "Medium",
    waterRequirementMM: 700,
    mspPerQuintal: 3400,
    marketPricePerQuintal: 4700,
    mandiPrice: 4300,
    onlinePrice: 5200,
    marketDemand: "High",
    defaultCosts: {
      seeds: 7500,
      fertilizer: 6800,
      pesticide: 4200,
      labor: 12000,
      irrigation: 5200,
      transport: 3000,
      misc: 2600,
    },
    mspHistory: [
      { year: 2021, msp: 2700 },
      { year: 2022, msp: 2950 },
      { year: 2023, msp: 3180 },
      { year: 2024, msp: 3400 },
    ],
    soilSuitability: {
      Alluvial: 82,
      "Black Cotton Soil": 70,
      "Red Laterite": 88,
    },
    temperatureRange: { min: 12, max: 26 },
  },
];

const regions = [
  {
    district: "Ludhiana",
    state: "Punjab",
    soilType: "Alluvial",
    avgRainfallMM: 680,
    yieldMultiplier: 1.25,
    irrigationAvailability: "Good",
    waterAvailabilityMM: 1000,
    supportedFarmingTypes: ["open_field", "protected"],
    recommendedIrrigationTypes: ["canal", "sprinkler", "drip"],
    costAdjustmentByCategory: {
      Cereals: 1.0,
      "Cash Crops": 1.03,
      Oilseeds: 0.98,
      Horticulture: 1.07,
      Spices: 1.05,
      Pulses: 0.99,
    },
    costAdjustmentByFarmingType: {
      open_field: 1.0,
      protected: 1.16,
      hydroponic: 1.34,
    },
    riskFactors: [
      {
        factor: "Groundwater Depletion",
        severity: "High",
        description: "Critical decline in water table.",
      },
    ],
    govSchemes: [
      {
        name: "PB Electricity Subsidy",
        type: "Subsidy",
        description: "Free power for agriculture.",
        benefit: "Zero electricity cost",
      },
    ],
    weatherMock: { avgTempC: 30, forecast: genForecast(30, 2) },
  },
  {
    district: "Pune",
    state: "Maharashtra",
    soilType: "Black Cotton Soil",
    avgRainfallMM: 750,
    yieldMultiplier: 1.1,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 600,
    supportedFarmingTypes: ["open_field", "protected", "hydroponic"],
    recommendedIrrigationTypes: ["drip", "sprinkler", "borewell"],
    costAdjustmentByCategory: {
      Cereals: 1.02,
      "Cash Crops": 1.05,
      Oilseeds: 1.01,
      Horticulture: 1.1,
      Spices: 1.06,
      Pulses: 1.0,
    },
    costAdjustmentByFarmingType: {
      open_field: 1.0,
      protected: 1.2,
      hydroponic: 1.42,
    },
    riskFactors: [
      {
        factor: "Erratic Monsoon",
        severity: "Medium",
        description: "Rainfall timing is unpredictable.",
      },
    ],
    govSchemes: [
      {
        name: "Jalyukt Shivar",
        type: "Irrigation",
        description: "State water conservation scheme.",
        benefit: "Better water storage",
      },
    ],
    weatherMock: { avgTempC: 32, forecast: genForecast(32, 4) },
  },
  {
    district: "Patna",
    state: "Bihar",
    soilType: "Alluvial",
    avgRainfallMM: 1150,
    yieldMultiplier: 1.0,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 750,
    supportedFarmingTypes: ["open_field", "protected"],
    recommendedIrrigationTypes: ["drip", "canal", "borewell"],
    costAdjustmentByCategory: {
      Cereals: 0.96,
      "Cash Crops": 1.03,
      Oilseeds: 0.98,
      Horticulture: 1.14,
      Spices: 1.08,
      Pulses: 0.97,
    },
    costAdjustmentByFarmingType: {
      open_field: 1.0,
      protected: 1.18,
      hydroponic: 1.4,
    },
    riskFactors: [
      {
        factor: "Annual Floods",
        severity: "High",
        description: "Ganga basin prone to monsoon floods.",
      },
    ],
    govSchemes: [
      {
        name: "Bihar Seed Subsidy",
        type: "Subsidy",
        description: "50% off on certified seeds.",
        benefit: "Halved seed cost",
      },
    ],
    weatherMock: { avgTempC: 31, forecast: genForecast(31, 6) },
  },
  {
    district: "Muzaffarpur",
    state: "Bihar",
    soilType: "Alluvial",
    avgRainfallMM: 1180,
    yieldMultiplier: 1.07,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 790,
    supportedFarmingTypes: ["open_field", "protected"],
    recommendedIrrigationTypes: ["drip", "canal", "borewell"],
    costAdjustmentByCategory: {
      Cereals: 0.95,
      "Cash Crops": 1.02,
      Oilseeds: 0.97,
      Horticulture: 1.16,
      Spices: 1.09,
      Pulses: 0.96,
    },
    costAdjustmentByFarmingType: {
      open_field: 1.0,
      protected: 1.17,
      hydroponic: 1.39,
    },
    riskFactors: [
      {
        factor: "Post-harvest loss",
        severity: "Medium",
        description: "Cold-chain bottlenecks for fruits and vegetables.",
      },
    ],
    govSchemes: [
      {
        name: "Bihar Horticulture Mission",
        type: "Incentive",
        description: "Support for strawberry, litchi and vegetable clusters.",
        benefit: "Protected cultivation subsidy support",
      },
    ],
    weatherMock: { avgTempC: 30, forecast: genForecast(30, 7) },
  },
  {
    district: "Nalanda",
    state: "Bihar",
    soilType: "Alluvial",
    avgRainfallMM: 1040,
    yieldMultiplier: 1.06,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 760,
    supportedFarmingTypes: ["open_field", "protected"],
    recommendedIrrigationTypes: ["drip", "canal", "sprinkler"],
    costAdjustmentByCategory: {
      Cereals: 0.97,
      "Cash Crops": 1.01,
      Oilseeds: 0.98,
      Horticulture: 1.13,
      Spices: 1.07,
      Pulses: 0.97,
    },
    costAdjustmentByFarmingType: {
      open_field: 1.0,
      protected: 1.18,
      hydroponic: 1.41,
    },
    riskFactors: [
      {
        factor: "Market volatility",
        severity: "Medium",
        description: "Vegetable prices fluctuate significantly during peak season.",
      },
    ],
    govSchemes: [
      {
        name: "Bihar Protected Cultivation Program",
        type: "Subsidy",
        description: "Polyhouse and drip irrigation subsidy for vegetables.",
        benefit: "Capex support up to 50%",
      },
    ],
    weatherMock: { avgTempC: 29, forecast: genForecast(29, 6) },
  },
  {
    district: "Palakkad",
    state: "Kerala",
    soilType: "Red Laterite",
    avgRainfallMM: 2300,
    yieldMultiplier: 1.05,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 1500,
    supportedFarmingTypes: ["open_field", "protected", "hydroponic"],
    recommendedIrrigationTypes: ["drip", "sprinkler"],
    costAdjustmentByCategory: {
      Cereals: 1.03,
      "Cash Crops": 1.06,
      Oilseeds: 1.04,
      Horticulture: 1.11,
      Spices: 1.09,
      Pulses: 1.02,
    },
    costAdjustmentByFarmingType: {
      open_field: 1.0,
      protected: 1.24,
      hydroponic: 1.46,
    },
    riskFactors: [
      {
        factor: "Soil Acidity",
        severity: "Medium",
        description: "High rainfall leads to acidic soil.",
      },
    ],
    govSchemes: [
      {
        name: "Subhiksha Keralam",
        type: "Incentive",
        description: "Promoting self-sufficiency in food.",
        benefit: "Processing grants",
      },
    ],
    weatherMock: { avgTempC: 28, forecast: genForecast(28, 15) },
  },
  {
    district: "Rajkot",
    state: "Gujarat",
    soilType: "Black Soil",
    avgRainfallMM: 620,
    yieldMultiplier: 1.15,
    irrigationAvailability: "Good",
    waterAvailabilityMM: 800,
    supportedFarmingTypes: ["open_field", "protected"],
    recommendedIrrigationTypes: ["drip", "sprinkler", "canal"],
    costAdjustmentByCategory: {
      Cereals: 1.01,
      "Cash Crops": 1.04,
      Oilseeds: 1.02,
      Horticulture: 1.09,
      Spices: 1.05,
      Pulses: 1.0,
    },
    costAdjustmentByFarmingType: {
      open_field: 1.0,
      protected: 1.19,
      hydroponic: 1.38,
    },
    riskFactors: [
      {
        factor: "Heat Waves",
        severity: "Medium",
        description: "Severe summer temperatures.",
      },
    ],
    govSchemes: [
      {
        name: "Sujalam Sufalam",
        type: "Water",
        description: "Conserving runoff water.",
        benefit: "Groundwater recharge",
      },
    ],
    weatherMock: { avgTempC: 34, forecast: genForecast(34, 3) },
  },
  {
    district: "Belgaum",
    state: "Karnataka",
    soilType: "Mixed Red/Black",
    avgRainfallMM: 1050,
    yieldMultiplier: 1.1,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 700,
    supportedFarmingTypes: ["open_field", "protected"],
    recommendedIrrigationTypes: ["drip", "borewell", "canal"],
    costAdjustmentByCategory: {
      Cereals: 0.99,
      "Cash Crops": 1.05,
      Oilseeds: 1.0,
      Horticulture: 1.12,
      Spices: 1.07,
      Pulses: 0.98,
    },
    costAdjustmentByFarmingType: {
      open_field: 1.0,
      protected: 1.2,
      hydroponic: 1.4,
    },
    riskFactors: [
      {
        factor: "Pest Attack",
        severity: "Medium",
        description: "Sugarcane borer is common.",
      },
    ],
    govSchemes: [
      {
        name: "Raitha Siri",
        type: "Incentive",
        description: "Promotion of millets and cash crops.",
        benefit: "₹10,000/ha incentive",
      },
    ],
    weatherMock: { avgTempC: 27, forecast: genForecast(27, 5) },
  },
];

const seedDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not defined");

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear all existing data
    await Promise.all([
      Category.deleteMany({}),
      State.deleteMany({}),
      Irrigation.deleteMany({}),
      CostParameter.deleteMany({}),
      Crop.deleteMany({}),
      Region.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Seed Master Data
    await Promise.all([
      Category.insertMany(categories),
      State.insertMany(states),
      Irrigation.insertMany(irrigations),
      CostParameter.insertMany(costs),
    ]);
    console.log("🛠️  Seeded Master Data");

    // Seed Main Entities
    const insertedCrops = await Crop.insertMany(crops);
    const insertedRegions = await Region.insertMany(regions);

    console.log(`🌾 Seeded ${insertedCrops.length} crops`);
    console.log(`🗺️  Seeded ${insertedRegions.length} regions`);
    console.log("✅ Database successfully overhauled with realistic data!");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
};

seedDB();
