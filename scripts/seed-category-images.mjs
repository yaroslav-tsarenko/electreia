import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

const IMAGES = {
  "audio-headphones":
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
  "laptops-computers":
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80",
  "smartphones-tablets":
    "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1200&q=80",
  "displays-monitors":
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
  "gaming-consoles":
    "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1200&q=80",
  peripherals:
    "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=1200&q=80",
  "cameras-drones":
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
  "printers-office":
    "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
  "smart-home":
    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
  wearables:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";

let updated = 0;
for (const [slug, url] of Object.entries(IMAGES)) {
  const result = await prisma.category.updateMany({
    where: { slug },
    data: { imageUrl: url },
  });
  if (result.count > 0) {
    updated += result.count;
    console.log(`  ✓ ${slug} → set imageUrl`);
  }
}

const remaining = await prisma.category.updateMany({
  where: { parentId: null, imageUrl: null },
  data: { imageUrl: DEFAULT_IMAGE },
});
if (remaining.count > 0) {
  console.log(`  ✓ fallback image for ${remaining.count} root categories without one`);
}

console.log(`\nDone. Updated ${updated + remaining.count} categories.`);
await prisma.$disconnect();
