import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => BigInt(x));

  for (const tid of adminIds) {
    await prisma.user.upsert({
      where: { telegramId: tid },
      update: { role: Role.ADMIN },
      create: { telegramId: tid, role: Role.ADMIN, firstName: "Admin" }
    });
  }

  const samples = [
    {
      displayName: "Whey Protein WPC (Chocolate)",
      description: "Classic whey concentrate for daily protein needs.",
      notes: "Great taste and mixability.",
      category: "protein",
      type: "WPC",
      form: "powder",
      flavor: "Chocolate",
      netWeightG: 1000,
      servingSizeG: 30,
      mixWithMlWater: 250,
      recommendedDailyServings: 1,
      shelfLifeMonths: 24,
      storage: "Store in a cool, dry place.",
      brand: "IronCore",
      line: "Performance",
      subline: "Whey",
      images: [
        "https://images.placeholders.dev/?width=800&height=800&text=WPC+Chocolate",
        "https://images.placeholders.dev/?width=800&height=800&text=WPC+Back"
      ],
      price: 29.99,
      currency: "USD",
      stockQuantity: 40,
      isActive: true
    },
    {
      displayName: "Whey Blend WPC+WPI (Vanilla)",
      description: "Balanced blend for lean gains.",
      category: "protein",
      type: "WPC+WPI",
      form: "powder",
      flavor: "Vanilla",
      netWeightG: 2000,
      servingSizeG: 32,
      mixWithMlWater: 300,
      recommendedDailyServings: 1,
      shelfLifeMonths: 24,
      storage: "Keep sealed after opening.",
      brand: "IronCore",
      line: "Elite",
      images: ["https://images.placeholders.dev/?width=800&height=800&text=WPC%2BWPI+Vanilla"],
      price: 49.99,
      currency: "USD",
      stockQuantity: 25,
      isActive: true
    },
    {
      displayName: "Creatine Monohydrate",
      description: "5g per serving. Supports strength and power.",
      category: "creatine",
      type: "creatine monohydrate",
      form: "powder",
      netWeightG: 300,
      servingSizeG: 5,
      mixWithMlWater: 200,
      recommendedDailyServings: 1,
      shelfLifeMonths: 36,
      storage: "Avoid moisture.",
      brand: "IronCore",
      line: "Essentials",
      images: ["https://images.placeholders.dev/?width=800&height=800&text=Creatine"],
      price: 14.99,
      currency: "USD",
      stockQuantity: 60,
      isActive: true
    },
    {
      displayName: "Pre-Workout (Berry Blast)",
      description: "Energy, focus, pump. Use 20 minutes before training.",
      category: "pre-workout",
      type: "pre-workout",
      form: "powder",
      flavor: "Berry Blast",
      netWeightG: 400,
      servingSizeG: 10,
      mixWithMlWater: 250,
      recommendedDailyServings: 1,
      shelfLifeMonths: 24,
      storage: "Keep away from heat.",
      brand: "IronCore",
      line: "Ignite",
      images: ["https://images.placeholders.dev/?width=800&height=800&text=Pre-Workout"],
      price: 19.99,
      currency: "USD",
      stockQuantity: 35,
      isActive: true
    },
    {
      displayName: "Multivitamins (60 capsules)",
      description: "Daily multivitamin support.",
      category: "vitamins",
      type: "multivitamins",
      form: "capsules",
      recommendedDailyServings: 2,
      shelfLifeMonths: 36,
      storage: "Store below 25°C.",
      brand: "IronCore",
      line: "Health",
      images: ["https://images.placeholders.dev/?width=800&height=800&text=Multivitamins"],
      price: 11.99,
      currency: "USD",
      stockQuantity: 80,
      isActive: true
    },
    {
      displayName: "Protein Bar (Peanut)",
      description: "High-protein snack bar.",
      category: "bars",
      type: "protein bar",
      form: "bar",
      flavor: "Peanut",
      netWeightG: 60,
      shelfLifeMonths: 12,
      storage: "Keep in a dry place.",
      brand: "IronCore",
      line: "Snack",
      images: ["https://images.placeholders.dev/?width=800&height=800&text=Protein+Bar"],
      price: 2.49,
      currency: "USD",
      stockQuantity: 200,
      isActive: true
    }
  ];

  for (const p of samples) {
    const slug = slugify(p.displayName) + "-" + Math.random().toString(16).slice(2,6);
    await prisma.product.create({
      data: { ...p, slug }
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
