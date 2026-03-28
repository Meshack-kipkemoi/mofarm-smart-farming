import { StaticImageData } from "next/image";

// Import your assets
import oranges from "@/assets/product-oranges.jpg";
import sukuma from "@/assets/product-sukuma.jpg";
import beans from "@/assets/product-beans.jpg";
import bananas from "@/assets/product-bananas.jpg";
import mangoes from "@/assets/product-mangoes.jpg";
import pineapple from "@/assets/product-pineapple.jpg";
import tomatoes from "@/assets/product-tomatoes.jpg";
import cabbage from "@/assets/product-cabbage.jpg";
import onions from "@/assets/product-onions.jpg";
import honey from "@/assets/product-honey.jpg";
import milk from "@/assets/product-milk.jpg";
import eggs from "@/assets/product-eggs.jpg";
import rice from "@/assets/product-rice.jpg";
import maize from "@/assets/product-maize.jpg";
import watermelon from "@/assets/product-watermelon.jpg";
import avocado from "@/assets/product-avocado.jpg";
import peas from "@/assets/product-peas.jpg";
import carrots from "@/assets/product-carrots.jpg";
import spinach from "@/assets/product-spinach.jpg";
import greengrams from "@/assets/product-greengrams.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image: StaticImageData | string; // Updated type for Next.js
  popular?: boolean;
};

export const products: Product[] = [
  // Fruits
  {
    id: "oranges",
    name: "Oranges",
    price: 150,
    unit: "kg",
    category: "Fruits",
    image: oranges,
    popular: true,
  },
  {
    id: "bananas",
    name: "Bananas",
    price: 120,
    unit: "bunch",
    category: "Fruits",
    image: bananas,
  },
  {
    id: "mangoes",
    name: "Mangoes",
    price: 200,
    unit: "kg",
    category: "Fruits",
    image: mangoes,
  },
  {
    id: "pineapple",
    name: "Pineapple",
    price: 180,
    unit: "piece",
    category: "Fruits",
    image: pineapple,
  },
  {
    id: "watermelon",
    name: "Watermelon",
    price: 250,
    unit: "piece",
    category: "Fruits",
    image: watermelon,
  },
  {
    id: "avocado",
    name: "Avocado",
    price: 100,
    unit: "kg",
    category: "Fruits",
    image: avocado,
  },

  // Vegetables
  {
    id: "sukuma",
    name: "Sukuma Wiki",
    price: 30,
    unit: "bunch",
    category: "Vegetables",
    image: sukuma,
    popular: true,
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    price: 80,
    unit: "kg",
    category: "Vegetables",
    image: tomatoes,
  },
  {
    id: "cabbage",
    name: "Cabbage",
    price: 60,
    unit: "piece",
    category: "Vegetables",
    image: cabbage,
  },
  {
    id: "onions",
    name: "Onions",
    price: 100,
    unit: "kg",
    category: "Vegetables",
    image: onions,
  },
  {
    id: "carrots",
    name: "Carrots",
    price: 90,
    unit: "kg",
    category: "Vegetables",
    image: carrots,
  },
  {
    id: "spinach",
    name: "Spinach",
    price: 40,
    unit: "bunch",
    category: "Vegetables",
    image: spinach,
  },
  {
    id: "peas",
    name: "Green Peas",
    price: 120,
    unit: "kg",
    category: "Vegetables",
    image: peas,
  },

  // Grains
  {
    id: "beans",
    name: "Beans",
    price: 180,
    unit: "kg",
    category: "Grains",
    image: beans,
    popular: true,
  },
  {
    id: "rice",
    name: "Rice",
    price: 200,
    unit: "kg",
    category: "Grains",
    image: rice,
  },
  {
    id: "maize",
    name: "Maize",
    price: 100,
    unit: "kg",
    category: "Grains",
    image: maize,
  },
  {
    id: "greengrams",
    name: "Green Grams",
    price: 220,
    unit: "kg",
    category: "Grains",
    image: greengrams,
  },

  // Dairy & Poultry
  {
    id: "honey",
    name: "Honey",
    price: 800,
    unit: "500ml",
    category: "Dairy & Others",
    image: honey,
  },
  {
    id: "milk",
    name: "Fresh Milk",
    price: 70,
    unit: "litre",
    category: "Dairy & Others",
    image: milk,
  },
  {
    id: "eggs",
    name: "Eggs",
    price: 450,
    unit: "tray",
    category: "Dairy & Others",
    image: eggs,
  },
];

export const categories = ["Fruits", "Vegetables", "Grains", "Dairy & Others"];
