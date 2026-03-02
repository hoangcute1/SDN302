import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./config/db";
import Member from "./models/Member";
import Brand from "./models/Brand";
import Perfume from "./models/Perfume";

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Member.deleteMany({});
  await Brand.deleteMany({});
  await Perfume.deleteMany({});

  console.log("Cleared existing data.");

  // Create admin
  const admin = await Member.create({
    email: "admin@gmail.com",
    password: "1",
    name: "Do Nam Trung",
    YOB: 1990,
    gender: true,
    isAdmin: true,
  });
  console.log("Admin created:", admin.email);

  // Create regular members
  const member1 = await Member.create({
    email: "user1@myteam.com",
    password: "user123",
    name: "Nguyen Van A",
    YOB: 1995,
    gender: true,
    isAdmin: false,
  });

  const member2 = await Member.create({
    email: "user2@myteam.com",
    password: "user123",
    name: "Tran Thi B",
    YOB: 1998,
    gender: false,
    isAdmin: false,
  });

  console.log("Members created.");

  // Create brands
  const brands = await Brand.insertMany([
    { brandName: "Chanel" },
    { brandName: "Dior" },
    { brandName: "Tom Ford" },
    { brandName: "Gucci" },
    { brandName: "Versace" },
    { brandName: "Yves Saint Laurent" },
  ]);
  console.log("Brands created:", brands.length);

  // Create perfumes
  const perfumes = await Perfume.insertMany([
    {
      perfumeName: "Chanel No. 5",
      uri: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
      price: 150,
      concentration: "EDP",
      description: "A timeless floral aldehyde fragrance that defines elegance and femininity.",
      ingredients: "Aldehydes, Ylang-Ylang, Neroli, Jasmine, Rose, Sandalwood, Vetiver",
      volume: 100,
      targetAudience: "female",
      brand: brands[0]!._id,
      isApproved: true,
      comments: [
        { rating: 3, content: "Absolutely iconic! A must-have.", author: member1._id },
      ],
    },
    {
      perfumeName: "Dior Sauvage",
      uri: "https://images.unsplash.com/photo-1594035910387-fbd1a485b12e?auto=format&fit=crop&q=80&w=600",
      price: 120,
      concentration: "EDT",
      description: "A bold and fresh fragrance inspired by wide-open spaces under a burning desert sky.",
      ingredients: "Bergamot, Sichuan Pepper, Lavender, Ambroxan, Cedar",
      volume: 100,
      targetAudience: "male",
      brand: brands[1]!._id,
      isApproved: true,
      comments: [
        { rating: 3, content: "Best office fragrance for men!", author: member2._id },
      ],
    },
    {
      perfumeName: "Tom Ford Oud Wood",
      uri: "https://images.unsplash.com/photo-1616949113060-3191630c33ee?auto=format&fit=crop&q=80&w=600",
      price: 350,
      concentration: "EDP",
      description: "A rare and exotic blend of oud wood, rosewood, cardamom and Chinese pepper.",
      ingredients: "Oud Wood, Rosewood, Cardamom, Chinese Pepper, Tonka Bean, Vetiver, Amber",
      volume: 50,
      targetAudience: "unisex",
      brand: brands[2]!._id,
      isApproved: true,
    },
    {
      perfumeName: "Gucci Bloom",
      uri: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600",
      price: 130,
      concentration: "EDP",
      description: "A rich white floral scent created to unfold like its name.",
      ingredients: "Tuberose, Jasmine Sambac, Rangoon Creeper",
      volume: 100,
      targetAudience: "female",
      brand: brands[3]!._id,
      isApproved: true,
    },
    {
      perfumeName: "Versace Eros",
      uri: "https://images.unsplash.com/photo-1557170334-a763171665d0?auto=format&fit=crop&q=80&w=600",
      price: 95,
      concentration: "EDT",
      description: "An invigorating fragrance that embodies strength and passion.",
      ingredients: "Mint, Green Apple, Lemon, Tonka Bean, Ambroxan, Geranium, Vanilla",
      volume: 100,
      targetAudience: "male",
      brand: brands[4]!._id,
      isApproved: true,
    },
    {
      perfumeName: "YSL Libre",
      uri: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
      price: 140,
      concentration: "EDP",
      description: "A daring and bold lavender blend that celebrates freedom.",
      ingredients: "Lavender, Orange Blossom, Musk, Vanilla, Cedar",
      volume: 90,
      targetAudience: "female",
      brand: brands[5]!._id,
      isApproved: true,
    },
    {
      perfumeName: "Chanel Bleu de Chanel",
      uri: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=600",
      price: 160,
      concentration: "Extrait",
      description: "An intensely aromatic woody fragrance that represents the essence of masculine sophistication.",
      ingredients: "Citrus, Mint, Pink Pepper, Iso E Super, Cedar, Sandalwood",
      volume: 100,
      targetAudience: "male",
      brand: brands[0]!._id,
      isApproved: true,
    },
    {
      perfumeName: "Tom Ford Black Orchid",
      uri: "https://images.unsplash.com/photo-1583445013765-48c220019989?auto=format&fit=crop&q=80&w=600",
      price: 280,
      concentration: "Extrait",
      description: "A luxurious and sensual fragrance of rich dark accords and an alluring potion of black orchids.",
      ingredients: "Black Truffle, Ylang-Ylang, Black Orchid, Lotus Wood, Dark Chocolate, Patchouli",
      volume: 50,
      targetAudience: "unisex",
      brand: brands[2]!._id,
      isApproved: true,
    },
    {
      perfumeName: "Dior Sauvage",
      uri: "https://images.unsplash.com/photo-1544145945-f904253db0ad?auto=format&fit=crop&q=80&w=600",
      price: 120,
      concentration: "EDT",
      description: "A bold and fresh fragrance inspired by wide-open spaces under a burning desert sky.",
      ingredients: "Bergamot, Sichuan Pepper, Lavender, Ambroxan, Cedar",
      volume: 100,
      targetAudience: "male",
      brand: brands[1]!._id,
      isApproved: true,
    },
  ]);

  console.log("Perfumes created:", perfumes.length);
  console.log("\nSeed completed successfully!");
  console.log("Admin login: admin@gmail.com / 1");
  console.log("User login: user1@myteam.com / user123");

  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
