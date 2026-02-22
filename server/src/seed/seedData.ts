import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import Crop from "../models/Crop";
import Region from "../models/Region";

const crops = [
  {
    name: "Rice (Paddy)",
    category: "Cereal",
    baseYieldPerAcre: 22,
    growthDurationDays: 120,
    waterRequirement: "High",
    mspPerQuintal: 2203,
    marketPricePerQuintal: 2450,
    defaultCosts: {
      seeds: 1200,
      fertilizer: 3500,
      pesticide: 1500,
      labor: 5000,
      irrigation: 3000,
      transport: 800,
      misc: 1000,
    },
  },
  {
    name: "Wheat",
    category: "Cereal",
    baseYieldPerAcre: 20,
    growthDurationDays: 135,
    waterRequirement: "Medium",
    mspPerQuintal: 2275,
    marketPricePerQuintal: 2500,
    defaultCosts: {
      seeds: 1000,
      fertilizer: 3000,
      pesticide: 1200,
      labor: 4000,
      irrigation: 2500,
      transport: 700,
      misc: 800,
    },
  },
  {
    name: "Maize",
    category: "Cereal",
    baseYieldPerAcre: 25,
    growthDurationDays: 100,
    waterRequirement: "Medium",
    mspPerQuintal: 2090,
    marketPricePerQuintal: 2200,
    defaultCosts: {
      seeds: 900,
      fertilizer: 2800,
      pesticide: 1000,
      labor: 3500,
      irrigation: 2000,
      transport: 600,
      misc: 700,
    },
  },
  {
    name: "Cotton",
    category: "Cash Crop",
    baseYieldPerAcre: 8,
    growthDurationDays: 180,
    waterRequirement: "High",
    mspPerQuintal: 6620,
    marketPricePerQuintal: 7200,
    defaultCosts: {
      seeds: 2000,
      fertilizer: 4000,
      pesticide: 3000,
      labor: 6000,
      irrigation: 3500,
      transport: 1000,
      misc: 1500,
    },
  },
  {
    name: "Sugarcane",
    category: "Cash Crop",
    baseYieldPerAcre: 300,
    growthDurationDays: 365,
    waterRequirement: "High",
    mspPerQuintal: 315,
    marketPricePerQuintal: 350,
    defaultCosts: {
      seeds: 5000,
      fertilizer: 5000,
      pesticide: 2000,
      labor: 8000,
      irrigation: 4000,
      transport: 2000,
      misc: 2000,
    },
  },
  {
    name: "Soybean",
    category: "Oilseed",
    baseYieldPerAcre: 10,
    growthDurationDays: 95,
    waterRequirement: "Low",
    mspPerQuintal: 4600,
    marketPricePerQuintal: 5000,
    defaultCosts: {
      seeds: 1500,
      fertilizer: 2500,
      pesticide: 1200,
      labor: 3500,
      irrigation: 1000,
      transport: 600,
      misc: 700,
    },
  },
  {
    name: "Mustard",
    category: "Oilseed",
    baseYieldPerAcre: 7,
    growthDurationDays: 110,
    waterRequirement: "Low",
    mspPerQuintal: 5650,
    marketPricePerQuintal: 6200,
    defaultCosts: {
      seeds: 600,
      fertilizer: 2000,
      pesticide: 800,
      labor: 3000,
      irrigation: 1200,
      transport: 500,
      misc: 500,
    },
  },
  {
    name: "Groundnut",
    category: "Oilseed",
    baseYieldPerAcre: 9,
    growthDurationDays: 120,
    waterRequirement: "Medium",
    mspPerQuintal: 6377,
    marketPricePerQuintal: 6800,
    defaultCosts: {
      seeds: 3000,
      fertilizer: 2500,
      pesticide: 1500,
      labor: 4000,
      irrigation: 1800,
      transport: 700,
      misc: 800,
    },
  },
  {
    name: "Jowar (Sorghum)",
    category: "Millet",
    baseYieldPerAcre: 8,
    growthDurationDays: 100,
    waterRequirement: "Low",
    mspPerQuintal: 3225,
    marketPricePerQuintal: 3500,
    defaultCosts: {
      seeds: 500,
      fertilizer: 1500,
      pesticide: 600,
      labor: 2500,
      irrigation: 800,
      transport: 400,
      misc: 400,
    },
  },
  {
    name: "Bajra (Pearl Millet)",
    category: "Millet",
    baseYieldPerAcre: 9,
    growthDurationDays: 85,
    waterRequirement: "Low",
    mspPerQuintal: 2500,
    marketPricePerQuintal: 2800,
    defaultCosts: {
      seeds: 400,
      fertilizer: 1200,
      pesticide: 500,
      labor: 2000,
      irrigation: 600,
      transport: 350,
      misc: 350,
    },
  },
];

const regions = [
  {
    district: "Ludhiana",
    state: "Punjab",
    soilType: "Alluvial",
    avgRainfallMM: 740,
    yieldMultiplier: 1.35,
    irrigationAvailability: "Good",
    riskFactors: [
      {
        factor: "Groundwater Depletion",
        severity: "High",
        description:
          "Over-extraction of groundwater for paddy cultivation is a growing concern.",
      },
    ],
  },
  {
    district: "Karnal",
    state: "Haryana",
    soilType: "Alluvial",
    avgRainfallMM: 680,
    yieldMultiplier: 1.25,
    irrigationAvailability: "Good",
    riskFactors: [
      {
        factor: "Soil Salinity",
        severity: "Medium",
        description:
          "Increasing salinity due to canal irrigation in some areas.",
      },
    ],
  },
  {
    district: "Lucknow",
    state: "Uttar Pradesh",
    soilType: "Alluvial",
    avgRainfallMM: 900,
    yieldMultiplier: 1.1,
    irrigationAvailability: "Moderate",
    riskFactors: [
      {
        factor: "Flood Risk",
        severity: "Medium",
        description: "Low-lying areas prone to flooding during monsoon season.",
      },
    ],
  },
  {
    district: "Indore",
    state: "Madhya Pradesh",
    soilType: "Black Cotton Soil",
    avgRainfallMM: 950,
    yieldMultiplier: 1.15,
    irrigationAvailability: "Moderate",
    riskFactors: [
      {
        factor: "Erratic Monsoon",
        severity: "Medium",
        description: "Monsoon variability affects soybean and cotton yields.",
      },
    ],
  },
  {
    district: "Nagpur",
    state: "Maharashtra",
    soilType: "Black Cotton Soil",
    avgRainfallMM: 1100,
    yieldMultiplier: 1.05,
    irrigationAvailability: "Moderate",
    riskFactors: [
      {
        factor: "Cotton Pest",
        severity: "High",
        description:
          "Pink bollworm and whitefly infestations are recurring issues.",
      },
      {
        factor: "Farmer Debt",
        severity: "High",
        description:
          "High input costs for cotton can lead to debt traps in bad years.",
      },
    ],
  },
  {
    district: "Jodhpur",
    state: "Rajasthan",
    soilType: "Sandy/Arid",
    avgRainfallMM: 360,
    yieldMultiplier: 0.7,
    irrigationAvailability: "Poor",
    riskFactors: [
      {
        factor: "Drought",
        severity: "High",
        description:
          "Severe water scarcity. Crop failures are common without irrigation.",
      },
      {
        factor: "Extreme Heat",
        severity: "Medium",
        description: "Temperatures exceeding 45°C can damage crops.",
      },
    ],
  },
  {
    district: "Rajkot",
    state: "Gujarat",
    soilType: "Black Soil",
    avgRainfallMM: 620,
    yieldMultiplier: 1.0,
    irrigationAvailability: "Moderate",
    riskFactors: [
      {
        factor: "Cyclone Risk",
        severity: "Medium",
        description:
          "Coastal proximity brings cyclone risks during late monsoon.",
      },
    ],
  },
  {
    district: "Belgaum",
    state: "Karnataka",
    soilType: "Red Laterite",
    avgRainfallMM: 1050,
    yieldMultiplier: 1.1,
    irrigationAvailability: "Moderate",
    riskFactors: [
      {
        factor: "Price Crash Risk",
        severity: "Medium",
        description: "Sugarcane glut can lead to delayed mill payments.",
      },
    ],
  },
  {
    district: "Thanjavur",
    state: "Tamil Nadu",
    soilType: "Alluvial (Delta)",
    avgRainfallMM: 950,
    yieldMultiplier: 1.3,
    irrigationAvailability: "Good",
    riskFactors: [
      {
        factor: "Cyclone/Flood",
        severity: "Medium",
        description: "Delta region vulnerable to cyclonic storms and flooding.",
      },
    ],
  },
  {
    district: "Guntur",
    state: "Andhra Pradesh",
    soilType: "Black Cotton Soil",
    avgRainfallMM: 850,
    yieldMultiplier: 1.15,
    irrigationAvailability: "Moderate",
    riskFactors: [
      {
        factor: "Pest Risk",
        severity: "Medium",
        description:
          "Cotton and chili crops face pest pressure requiring intensive management.",
      },
    ],
  },
  {
    district: "Patna",
    state: "Bihar",
    soilType: "Alluvial",
    avgRainfallMM: 1100,
    yieldMultiplier: 0.9,
    irrigationAvailability: "Moderate",
    riskFactors: [
      {
        factor: "Flood Risk",
        severity: "High",
        description:
          "Annual flooding in Gangetic plains causes significant crop damage.",
      },
      {
        factor: "Poor Infrastructure",
        severity: "Medium",
        description:
          "Limited cold storage and market access increases post-harvest losses.",
      },
    ],
  },
  {
    district: "Bardhaman",
    state: "West Bengal",
    soilType: "Alluvial",
    avgRainfallMM: 1400,
    yieldMultiplier: 1.2,
    irrigationAvailability: "Good",
    riskFactors: [
      {
        factor: "Excess Rainfall",
        severity: "Medium",
        description:
          "Heavy rainfall can cause waterlogging affecting crop roots.",
      },
    ],
  },
];

const seedDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Crop.deleteMany({});
    await Region.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert seed data
    const insertedCrops = await Crop.insertMany(crops);
    const insertedRegions = await Region.insertMany(regions);

    console.log(`🌾 Seeded ${insertedCrops.length} crops`);
    console.log(`🗺️  Seeded ${insertedRegions.length} regions`);
    console.log("✅ Database seeded successfully!");

    process.exit(0);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedDB();
