import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const products = [
  {
    name: "Men's Cotton Kurta",
    description: "Premium lightweight cotton kurta ideal for daily wear and festive occasions.",
    price: 799,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494987/Men_s_Cotton_Kurta_mblyou.jpg",
    category: "Men",
    sizes: ["M", "L", "XL", "XXL"],
    stock: 40
  },
  {
    name: "Men's Linen Shirt",
    description: "Breathable linen shirt with a relaxed fit, perfect for Indian summers.",
    price: 999,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494984/Men_s_Linen_Shirt_hozkwx.jpg",
    category: "Men",
    sizes: ["M", "L", "XL"],
    stock: 35
  },
  {
    name: "Men's Slim Fit Jeans",
    description: "Classic slim-fit Indian denim with stretch for all-day comfort.",
    price: 1299,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494982/Men_s_Slim_Fit_Jeans_gonfxr.jpg",
    category: "Men",
    sizes: ["M", "L", "XL", "XXL"],
    stock: 30
  },
  {
    name: "Men's Hooded Sweatshirt",
    description: "Soft fleece hoodie for cozy evenings and winter comfort.",
    price: 899,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494981/Men_s_Hooded_Sweatshirt_optoyb.jpg",
    category: "Men",
    sizes: ["M", "L", "XL", "XXL"],
    stock: 25
  },

  // WOMEN
  {
    name: "Women's Floral Kurti",
    description: "Elegant printed kurti made from soft rayon fabric. Perfect for casual outings.",
    price: 749,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494979/Women_s_Floral_Kurti_mfxprk.jpg",
    category: "Women",
    sizes: ["S", "M", "L", "XL"],
    stock: 50
  },
  {
    name: "Women's Anarkali Dress",
    description: "Beautiful Anarkali dress with rich detailing, ideal for festive events.",
    price: 1599,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494978/Women_s_Anarkali_Dress_vxlztj.jpg",
    category: "Women",
    sizes: ["S", "M", "L"],
    stock: 20
  },
  {
    name: "Women's Cotton Saree",
    description: "Handwoven cotton saree with a minimalistic elegant finish.",
    price: 1199,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494962/Women_s_Cotton_Saree_bvnzhu.jpg",
    category: "Women",
    sizes: ["S", "M", "L"],
    stock: 15
  },
  {
    name: "Women's Denim Jacket",
    description: "Trendy blue denim jacket perfect for layering your outfits.",
    price: 1299,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494974/Women_s_Denim_Jacket_u1mg3y.jpg",
    category: "Women",
    sizes: ["S", "M", "L"],
    stock: 30
  },
  {
    name: "Women's Palazzo Pants",
    description: "High-waist palazzo pants with soft breathable fabric.",
    price: 699,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494973/Women_s_Palazzo_Pants_axuos4.jpg",
    category: "Women",
    sizes: ["S", "M", "L", "XL"],
    stock: 45
  },
  {
    name: "Women's Winter Sweater",
    description: "Soft knitted sweater ideal for winter styling and comfort.",
    price: 999,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494972/Women_s_Winter_Sweater_q4rmko.jpg",
    category: "Women",
    sizes: ["S", "M", "L", "XL"],
    stock: 28
  },

  // KIDS
  {
    name: "Kids Cotton T-Shirt",
    description: "Soft cotton t-shirt with fun prints for kids aged 4–12.",
    price: 399,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494971/Kids_Cotton_T-Shirt_fwzbne.jpg",
    category: "Kids",
    sizes: ["S", "M", "L"],
    stock: 50
  },
  {
    name: "Kids Denim Overalls",
    description: "Comfortable and durable denim overalls for playful kids.",
    price: 899,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494969/Kids_Denim_Overalls_dnh2lf.jpg",
    category: "Kids",
    sizes: ["S", "M", "L"],
    stock: 20
  },
  {
    name: "Kids Hoodie",
    description: "Warm & cozy hoodie made from soft fleece for winter.",
    price: 699,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494968/Kids_Hoodie_sbc3rl.jpg",
    category: "Kids",
    sizes: ["S", "M", "L"],
    stock: 25
  },
  {
    name: "Kids Printed Dress",
    description: "Adorable printed dress for girls with soft cotton fabric.",
    price: 649,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494967/Kids_Printed_Dress_ns82ga.jpg",
    category: "Kids",
    sizes: ["S", "M", "L"],
    stock: 30
  },

  // EXTRA PREMIUM LOOK ITEMS
  {
    name: "Men's Ethnic Nehru Jacket",
    description: "Stylish Nehru jacket made from premium woven fabric. Ideal for festive wear.",
    price: 1499,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494966/Men_s_Ethnic_Nehru_Jacket_zngtch.jpg",
    category: "Men",
    sizes: ["M", "L", "XL"],
    stock: 18
  },
  {
    name: "Women's Silk Dupatta",
    description: "Rich Banarasi silk dupatta with traditional Indian motifs.",
    price: 899,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494964/Women_s_Silk_Dupatta_vhtndz.jpg",
    category: "Women",
    sizes: ["S", "M", "L"],
    stock: 35
  },
  {
    name: "Kids Festive Kurta Set",
    description: "Traditional kurta and pajama set for kids ideal for festivals.",
    price: 999,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494963/Kids_Festive_Kurta_Set_hpkoue.jpg",
    category: "Kids",
    sizes: ["S", "M", "L"],
    stock: 22
  },
  {
    name: "Men's Track Pants",
    description: "Comfortable track pants ideal for gym and casual wear.",
    price: 799,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494963/Men_s_Track_Pants_k3ybdb.jpg",
    category: "Men",
    sizes: ["M", "L", "XL", "XXL"],
    stock: 38
  },
  {
    name: "Women's Activewear Set",
    description: "Premium activewear set designed for comfort and flexibility.",
    price: 1399,
    image: "https://res.cloudinary.com/dqgjdxwgw/image/upload/v1764494962/Women_s_Activewear_Set_yqaf2q.jpg",
    category: "Women",
    sizes: ["S", "M", "L"],
    stock: 25
  }
];


const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('Products seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();