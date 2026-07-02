import { db } from "../src/lib/db";
import { slugify } from "../src/lib/format";

const categories = [
  { name: "Birthday Cakes", slug: "birthday-cakes", icon: "", order: 1, description: "Make every birthday unforgettable with our freshly baked celebration cakes." },
  { name: "Anniversary Cakes", slug: "anniversary-cakes", icon: "", order: 2, description: "Romantic, elegant cakes baked with love for your special milestones." },
  { name: "Wedding Cakes", slug: "wedding-cakes", icon: "", order: 3, description: "Handcrafted tiered wedding cakes for your big day." },
  { name: "Designer Cakes", slug: "designer-cakes", icon: "", order: 4, description: "Custom themed designer cakes made to your imagination." },
  { name: "Eggless Cakes", slug: "eggless-cakes", icon: "", order: 5, description: "100% eggless cakes with the same soft, moist, premium taste." },
  { name: "Pastries", slug: "pastries", icon: "", order: 6, description: "Fresh individual pastries — perfect for a sweet little treat." },
];

type SeedProduct = {
  name: string;
  cat: string;
  image: string;
  description: string;
  ingredients: string;
  prepHours: number;
  rating: number;
  reviewCount: number;
  flags: { featured?: boolean; best?: boolean; fresh?: boolean; seasonal?: boolean; eggless?: boolean };
  tags: string[];
  weights: { w: string; price: number; mrp?: number }[];
};

const products: SeedProduct[] = [
  {
    name: "Classic Chocolate Truffle",
    cat: "birthday-cakes",
    image: "chocolate-truffle.png",
    description:
      "Our most loved cake — layers of soft chocolate sponge soaked in sugar syrup, filled with rich Belgian chocolate ganache and wrapped in a glossy truffle coating. Finished with dark chocolate shavings. Deep, intense, melt-in-the-mouth chocolate.",
    ingredients:
      "Refined flour, sugar, Belgian dark chocolate, fresh cream, cocoa powder, butter, eggs, milk, baking powder, vanilla essence.",
    prepHours: 24, rating: 4.9, reviewCount: 218,
    flags: { featured: true, best: true, fresh: true },
    tags: ["chocolate", "birthday", "bestseller"],
    weights: [{ w: "1", price: 650, mrp: 750 }, { w: "1.5", price: 880, mrp: 990 }, { w: "2", price: 1150, mrp: 1300 }, { w: "3", price: 1650 }, { w: "5", price: 2650 }],
  },
  {
    name: "Vanilla Rainbow Sprinkle Cake",
    cat: "birthday-cakes",
    image: "rainbow-sprinkle.png",
    description:
      "A joyful vanilla butter cake covered in fluffy vanilla buttercream and rolled in bright rainbow sprinkles. Light, sweet and absolutely perfect for kids' birthdays.",
    ingredients: "Refined flour, sugar, butter, eggs, milk, vanilla essence, baking powder, rainbow sprinkles, cream.",
    prepHours: 12, rating: 4.8, reviewCount: 142,
    flags: { fresh: true, best: true },
    tags: ["vanilla", "birthday", "kids"],
    weights: [{ w: "1", price: 550, mrp: 620 }, { w: "1.5", price: 760 }, { w: "2", price: 980 }, { w: "3", price: 1450 }, { w: "5", price: 2350 }],
  },
  {
    name: "Fresh Fruit Cake",
    cat: "birthday-cakes",
    image: "fruit-cake.png",
    description:
      "Soft vanilla sponge layered with fresh whipped cream and topped with a generous assortment of fresh seasonal fruits — kiwi, strawberry, grapes and pineapple. Light, fresh and fruity.",
    ingredients: "Refined flour, sugar, eggs, fresh cream, vanilla essence, fresh kiwi, strawberry, grapes, pineapple, glaze.",
    prepHours: 12, rating: 4.7, reviewCount: 98,
    flags: { featured: true },
    tags: ["fruit", "fresh", "birthday"],
    weights: [{ w: "1", price: 600, mrp: 700 }, { w: "1.5", price: 820 }, { w: "2", price: 1080 }, { w: "3", price: 1550 }, { w: "5", price: 2500 }],
  },
  {
    name: "Red Velvet Romance",
    cat: "anniversary-cakes",
    image: "red-velvet.png",
    description:
      "A romantic red velvet sponge with subtle cocoa notes, layered with smooth cream cheese frosting and a delicate heart detail. The perfect anniversary centrepiece.",
    ingredients: "Refined flour, sugar, butter, buttermilk, cocoa powder, beetroot red, cream cheese, vanilla, eggs.",
    prepHours: 24, rating: 4.9, reviewCount: 167,
    flags: { featured: true, best: true },
    tags: ["red velvet", "anniversary", "cream cheese"],
    weights: [{ w: "1", price: 720, mrp: 820 }, { w: "1.5", price: 980 }, { w: "2", price: 1280 }, { w: "3", price: 1850 }, { w: "5", price: 2950 }],
  },
  {
    name: "Strawberry Cream Heart",
    cat: "anniversary-cakes",
    image: "strawberry-heart.png",
    description:
      "A heart-shaped vanilla sponge filled with real strawberry cream and crowned with fresh strawberries. Sweet, romantic and made to celebrate love.",
    ingredients: "Refined flour, sugar, eggs, butter, fresh strawberries, cream, strawberry pulp, vanilla essence.",
    prepHours: 18, rating: 4.7, reviewCount: 76,
    flags: { featured: true },
    tags: ["strawberry", "heart", "anniversary"],
    weights: [{ w: "1", price: 680, mrp: 780 }, { w: "1.5", price: 920 }, { w: "2", price: 1200 }, { w: "3", price: 1750 }],
  },
  {
    name: "Royal Vanilla Tier Wedding Cake",
    cat: "wedding-cakes",
    image: "wedding-tier.png",
    description:
      "An elegant three-tier vanilla butter cake with delicate hand-piped sugar flowers. A show-stopping centerpiece crafted for your wedding day. Pre-booking required 5 days in advance.",
    ingredients: "Refined flour, sugar, butter, eggs, milk, vanilla, fondant, sugar flowers, cream.",
    prepHours: 120, rating: 5.0, reviewCount: 41,
    flags: { featured: true },
    tags: ["wedding", "tier", "vanilla", "premium"],
    weights: [{ w: "2", price: 3200, mrp: 3600 }, { w: "3", price: 4500 }, { w: "5", price: 7200 }],
  },
  {
    name: "Floral Elegance Wedding Cake",
    cat: "wedding-cakes",
    image: "floral-wedding.png",
    description:
      "A two-tier blush wedding cake decorated with handcrafted sugar peonies and delicate gold leaf. Soft, elegant and unforgettable.",
    ingredients: "Refined flour, sugar, butter, eggs, vanilla, fondant, sugar peonies, edible gold leaf, cream.",
    prepHours: 96, rating: 4.9, reviewCount: 28,
    flags: { featured: true },
    tags: ["wedding", "floral", "premium"],
    weights: [{ w: "2", price: 2800, mrp: 3100 }, { w: "3", price: 3900 }, { w: "5", price: 6200 }],
  },
  {
    name: "Princess Crown Designer Cake",
    cat: "designer-cakes",
    image: "princess-crown.png",
    description:
      "A magical pink princess cake with a gold tiara, rosettes and pearls. Every little princess's dream birthday cake. Customisable with a name message.",
    ingredients: "Refined flour, sugar, butter, eggs, cream, fondant, edible gold, food colour (pink), vanilla.",
    prepHours: 36, rating: 4.8, reviewCount: 63,
    flags: { featured: true, best: true },
    tags: ["designer", "princess", "kids", "pink"],
    weights: [{ w: "1", price: 950, mrp: 1100 }, { w: "1.5", price: 1300 }, { w: "2", price: 1650 }, { w: "3", price: 2350 }],
  },
  {
    name: "Football Stadium Designer Cake",
    cat: "designer-cakes",
    image: "football-cake.png",
    description:
      "A green football-field cake with a white soccer ball on top — a winner for any little champion's birthday. Add the birthday star's name for free.",
    ingredients: "Refined flour, sugar, eggs, butter, cream, fondant, food colour (green), vanilla, chocolate.",
    prepHours: 36, rating: 4.8, reviewCount: 54,
    flags: { best: true },
    tags: ["designer", "football", "kids", "sports"],
    weights: [{ w: "1", price: 900, mrp: 1050 }, { w: "1.5", price: 1250 }, { w: "2", price: 1580 }, { w: "3", price: 2250 }],
  },
  {
    name: "Unicorn Magic Designer Cake",
    cat: "designer-cakes",
    image: "unicorn-cake.png",
    description:
      "A dreamy pastel unicorn cake with a golden horn, rainbow mane and fluttery eyelashes. Pure magic for a magical birthday.",
    ingredients: "Refined flour, sugar, eggs, butter, cream, fondant, edible gold, pastel food colours, vanilla.",
    prepHours: 36, rating: 4.9, reviewCount: 47,
    flags: { featured: true },
    tags: ["designer", "unicorn", "kids", "magic"],
    weights: [{ w: "1", price: 980, mrp: 1150 }, { w: "1.5", price: 1350 }, { w: "2", price: 1700 }, { w: "3", price: 2400 }],
  },
  {
    name: "Eggless Black Forest",
    cat: "eggless-cakes",
    image: "eggless-blackforest.png",
    description:
      "Classic eggless black forest — chocolate sponge layered with whipped cream, cherries and chocolate shavings, topped with glazed cherries. 100% eggless, 100% delicious.",
    ingredients: "Refined flour, sugar, condensed milk, butter, cocoa, fresh cream, cherries, chocolate shavings, vanilla.",
    prepHours: 18, rating: 4.7, reviewCount: 112,
    flags: { eggless: true, best: true, fresh: true },
    tags: ["eggless", "black forest", "chocolate"],
    weights: [{ w: "1", price: 600, mrp: 700 }, { w: "1.5", price: 820 }, { w: "2", price: 1080 }, { w: "3", price: 1550 }, { w: "5", price: 2500 }],
  },
  {
    name: "Eggless Butterscotch",
    cat: "eggless-cakes",
    image: "eggless-butterscotch.png",
    description:
      "Eggless butterscotch cake with crunchy caramel praline and smooth butterscotch cream. Sweet, buttery and irresistibly crunchy.",
    ingredients: "Refined flour, sugar, condensed milk, butter, butterscotch essence, caramel praline, cream.",
    prepHours: 18, rating: 4.6, reviewCount: 84,
    flags: { eggless: true, fresh: true },
    tags: ["eggless", "butterscotch", "caramel"],
    weights: [{ w: "1", price: 620, mrp: 700 }, { w: "1.5", price: 840 }, { w: "2", price: 1100 }, { w: "3", price: 1580 }],
  },
  {
    name: "Eggless Mango Cream",
    cat: "eggless-cakes",
    image: "eggless-mango.png",
    description:
      "A seasonal favourite — eggless vanilla sponge layered with real Alphonso mango cream and topped with fresh mango slices. Summer in every bite. Available during mango season.",
    ingredients: "Refined flour, sugar, condensed milk, butter, Alphonso mango pulp, fresh mango, cream, vanilla.",
    prepHours: 18, rating: 4.8, reviewCount: 39,
    flags: { eggless: true, seasonal: true },
    tags: ["eggless", "mango", "seasonal"],
    weights: [{ w: "1", price: 680, mrp: 780 }, { w: "1.5", price: 920 }, { w: "2", price: 1200 }, { w: "3", price: 1720 }],
  },
  {
    name: "Blueberry Cheesecake",
    cat: "pastries",
    image: "blueberry-cheesecake.png",
    description:
      "A creamy baked blueberry cheesecake on a buttery biscuit base, topped with a glossy blueberry compote. Rich, smooth and indulgent.",
    ingredients: "Cream cheese, fresh cream, sugar, blueberry compote, biscuit, butter, gelatin, vanilla.",
    prepHours: 12, rating: 4.9, reviewCount: 130,
    flags: { featured: true, best: true },
    tags: ["cheesecake", "blueberry", "pastry"],
    weights: [{ w: "0.5", price: 420, mrp: 480 }, { w: "1", price: 780, mrp: 880 }, { w: "2", price: 1500 }],
  },
  {
    name: "Choco Lava Pastry",
    cat: "pastries",
    image: "choco-lava.png",
    description:
      "A warm chocolate lava pastry with a molten chocolate centre that flows out at first cut. Dust with cocoa and serve warm for the ultimate indulgence.",
    ingredients: "Dark chocolate, butter, eggs, sugar, refined flour, cocoa, cream.",
    prepHours: 6, rating: 4.8, reviewCount: 96,
    flags: { fresh: true, best: true },
    tags: ["chocolate", "lava", "pastry", "warm"],
    weights: [{ w: "0.5", price: 180 }, { w: "1", price: 340 }, { w: "2", price: 640 }],
  },
  {
    name: "Strawberry Macaron (Box of 6)",
    cat: "pastries",
    image: "strawberry-macaron.png",
    description:
      "Delicate French almond macarons with a smooth strawberry cream filling. Crisp shell, chewy centre. A box of six — perfect for gifting.",
    ingredients: "Almond flour, icing sugar, egg whites, sugar, strawberry cream filling, food colour (pink).",
    prepHours: 24, rating: 4.7, reviewCount: 58,
    flags: { featured: true },
    tags: ["macaron", "strawberry", "french", "gift"],
    weights: [{ w: "0.3", price: 360, mrp: 420 }, { w: "0.5", price: 560 }],
  },
  {
    name: "Pineapple Pastry",
    cat: "pastries",
    image: "pineapple-pastry.png",
    description:
      "A classic bakery pineapple pastry — soft vanilla sponge, whipped cream and tangy pineapple, topped with a cherry. The nostalgic teatime favourite.",
    ingredients: "Refined flour, sugar, eggs, butter, fresh cream, pineapple, cherry, vanilla.",
    prepHours: 6, rating: 4.6, reviewCount: 73,
    flags: { fresh: true },
    tags: ["pineapple", "pastry", "classic"],
    weights: [{ w: "0.5", price: 160 }, { w: "1", price: 300 }, { w: "2", price: 560 }],
  },
  {
    name: "Coffee Walnut Cake",
    cat: "birthday-cakes",
    image: "coffee-walnut.png",
    description:
      "A rich coffee-walnut sponge with espresso buttercream and crunchy walnut halves. Bold coffee flavour meets nutty crunch — a grown-up favourite.",
    ingredients: "Refined flour, sugar, butter, eggs, instant coffee, walnuts, cream, cocoa, vanilla.",
    prepHours: 24, rating: 4.8, reviewCount: 61,
    flags: { best: true },
    tags: ["coffee", "walnut", "birthday"],
    weights: [{ w: "1", price: 680, mrp: 780 }, { w: "1.5", price: 920 }, { w: "2", price: 1200 }, { w: "3", price: 1720 }],
  },
];

const reviews = [
  { productName: "Classic Chocolate Truffle", name: "Aarav S.", rating: 5, title: "Best chocolate cake in Kanpur!", body: "Ordered for my wife's birthday. The truffle was so rich and fresh. Pickup was smooth. Will order again!" },
  { productName: "Red Velvet Romance", name: "Priya M.", rating: 5, title: "Absolutely romantic", body: "Cream cheese frosting was perfect. My husband loved it. Thank you Pihu team!" },
  { productName: "Eggless Black Forest", name: "Rohit K.", rating: 4, title: "Tasty and eggless", body: "Being vegetarian, eggless option matters. Taste was great, cherries were fresh." },
  { productName: "Princess Crown Designer Cake", name: "Sneha D.", rating: 5, title: "My daughter's dream cake", body: "The princess cake looked exactly like the photo. Worth every rupee." },
  { productName: "Blueberry Cheesecake", name: "Vikram T.", rating: 5, title: "Restaurant quality at home", body: "Cheesecake was creamy and the blueberry compote was generous. Highly recommend." },
  { productName: "Vanilla Rainbow Sprinkle Cake", name: "Anjali R.", rating: 5, title: "Kids went crazy", body: "Bright, fun and so yummy. Perfect for my son's 5th birthday." },
  { productName: "Unicorn Magic Designer Cake", name: "Meera J.", rating: 5, title: "Magical!", body: "The unicorn cake was the highlight of the party. Beautiful and delicious." },
  { productName: "Football Stadium Designer Cake", name: "Karan B.", rating: 4, title: "Champion cake", body: "My son loved it. Great detail on the field. Pickup was on time." },
];

const faqs = [
  { q: "Do you offer home delivery?", a: "No — to keep our cakes at peak freshness and the best prices, we operate on a pre-booking & store-pickup model only. Reserve online and collect your order from our bakery at your selected time." },
  { q: "How much advance booking is required?", a: "Most cakes need at least 24 hours. Designer and wedding cakes need 3–5 days. Each product page shows its exact preparation time." },
  { q: "Are your eggless cakes really eggless?", a: "Yes. Our eggless cakes are baked in a separate process using condensed-milk-based recipes, with no eggs at all." },
  { q: "How do I confirm my booking?", a: "After placing your order you'll receive a confirmation message on WhatsApp. Please reply to accept it. Unconfirmed orders may be cancelled." },
  { q: "What payment methods do you accept?", a: "You can choose Pay at Pickup or a mock online payment at checkout. For wedding and large orders, a token may be requested." },
  { q: "Can I customise a cake?", a: "Absolutely. Use the Special Requirements box at checkout to describe your customisation (message, colour, theme, less cream, extra chocolate, etc.). For fully custom designer cakes, message us on WhatsApp." },
  { q: "Do you write names on cakes?", a: "Yes! Add the exact message (e.g. 'Happy Birthday Aarav') in Special Requirements and we'll write it for free." },
];

async function main() {
  console.log("Seeding Pihu Cakes & Bakes...");

  // Wipe
  await db.review.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.weightPrice.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.pickupSlot.deleteMany();
  await db.disabledDate.deleteMany();
  await db.slotClosure.deleteMany();
  await db.coupon.deleteMany();
  await db.adminUser.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.user.deleteMany();
  await db.content.deleteMany();

  // Categories
  for (const c of categories) {
    await db.category.create({ data: c });
  }

  // Products
  for (const p of products) {
    const cat = await db.category.findUnique({ where: { slug: p.cat } });
    if (!cat) continue;
    const slug = slugify(p.name);
    const product = await db.product.create({
      data: {
        name: p.name,
        slug,
        categoryId: cat.id,
        description: p.description,
        ingredients: p.ingredients,
        prepHours: p.prepHours,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: !!p.flags.featured,
        isBestSeller: !!p.flags.best,
        isFreshToday: !!p.flags.fresh,
        isSeasonal: !!p.flags.seasonal,
        eggless: !!p.flags.eggless,
        tags: p.tags.join(","),
        status: "active",
        images: {
          create: [
            { url: `/products/${p.image}`, alt: p.name, order: 0 },
            { url: `/products/${p.image}`, alt: `${p.name} angle 2`, order: 1 },
            { url: `/products/${p.image}`, alt: `${p.name} slice`, order: 2 },
          ],
        },
        weights: {
          create: p.weights.map((w) => ({
            weight: w.w,
            label: WEIGHT_LABELS[w.w] ?? `${w.w} Pound`,
            price: w.price,
            mrp: w.mrp ?? null,
          })),
        },
      },
    });
  }

  // Reviews (approved, verified)
  for (const r of reviews) {
    const prod = await db.product.findFirst({ where: { name: r.productName } });
    if (!prod) continue;
    await db.review.create({
      data: {
        productId: prod.id,
        customerName: r.name,
        rating: r.rating,
        title: r.title,
        body: r.body,
        images: "[]",
        status: "approved",
        verified: true,
      },
    });
  }

  // Pickup slots
  const slots = [
    { label: "10:00 AM – 12:00 PM", startTime: "10:00", endTime: "12:00", maxOrders: 4, enabled: true, order: 1 },
    { label: "12:00 PM – 2:00 PM", startTime: "12:00", endTime: "14:00", maxOrders: 4, enabled: true, order: 2 },
    { label: "2:00 PM – 4:00 PM", startTime: "14:00", endTime: "16:00", maxOrders: 3, enabled: true, order: 3 },
    { label: "4:00 PM – 6:00 PM", startTime: "16:00", endTime: "18:00", maxOrders: 5, enabled: true, order: 4 },
    { label: "6:00 PM – 8:00 PM", startTime: "18:00", endTime: "20:00", maxOrders: 5, enabled: true, order: 5 },
  ];
  for (const s of slots) await db.pickupSlot.create({ data: s });

  // Coupons
  await db.coupon.create({ data: { code: "FRESH10", type: "PERCENT", value: 10, minOrder: 500, active: true } });
  await db.coupon.create({ data: { code: "PIHU100", type: "FLAT", value: 100, minOrder: 800, active: true } });
  await db.coupon.create({ data: { code: "WELCOME150", type: "FLAT", value: 150, minOrder: 1200, active: true } });

  // Admin
  await db.adminUser.create({
    data: { username: "admin", passwordHash: "pihu2024" },
  });

  // Content (store info, faqs, social)
  await db.content.create({ data: { key: "faqs", value: JSON.stringify(faqs) } });
  await db.content.create({ data: { key: "hero_banner", value: JSON.stringify({ title: "Freshly Baked. Made With Love.", subtitle: "Reserve your celebration cake online and pick it up fresh from our bakery.", cta: "Order Fresh Today" }) } });
  await db.content.create({ data: { key: "seasonal_promo", value: JSON.stringify({ title: "Mango Season Special", text: "Try our Eggless Alphonso Mango Cream Cake — only while fresh mangoes last!" }) } });

  console.log("Seed complete.");
}

const WEIGHT_LABELS: Record<string, string> = {
  "0.3": "Box of 6 (~0.3kg)",
  "0.5": "0.5 Pound (~0.23kg)",
  "1": "1 Pound (~0.45kg)",
  "1.5": "1.5 Pound (~0.68kg)",
  "2": "2 Pound (~0.91kg)",
  "3": "3 Pound (~1.36kg)",
  "5": "5 Pound (~2.27kg)",
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
