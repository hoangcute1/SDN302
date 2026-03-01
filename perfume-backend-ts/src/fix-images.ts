import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "./config/db";
import Perfume from "./models/Perfume";

const images: { [key: string]: string } = {
    "Chanel No. 5": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    "Dior Sauvage": "https://images.unsplash.com/photo-1544145945-f904253db0ad?auto=format&fit=crop&q=80&w=600",
    "Tom Ford Oud Wood": "https://images.unsplash.com/photo-1616949113060-3191630c33ee?auto=format&fit=crop&q=80&w=600",
    "Gucci Bloom": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600",
    "Versace Eros": "https://images.unsplash.com/photo-1557170334-a763171665d0?auto=format&fit=crop&q=80&w=600",
    "YSL Libre": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
    "Chanel Bleu de Chanel": "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=600",
    "Dior J'adore": "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=600",
    "Tom Ford Black Orchid": "https://images.unsplash.com/photo-1583445013765-48c220019989?auto=format&fit=crop&q=80&w=600"
};

const fixImages = async () => {
    await connectDB();
    console.log("Connected to DB...");

    for (const [name, url] of Object.entries(images)) {
        const result = await Perfume.updateOne(
            { perfumeName: name },
            { $set: { uri: url } }
        );
        if (result.modifiedCount > 0) {
            console.log(`Updated image for: ${name}`);
        } else {
            console.log(`No change or not found: ${name}`);
        }
    }

    console.log("\nImage fix completed!");
    await mongoose.disconnect();
    process.exit(0);
};

fixImages().catch(err => {
    console.error(err);
    process.exit(1);
});
