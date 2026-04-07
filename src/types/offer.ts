export type ProductOffer = {
  offer_id: string;
  discount_percentage: number;
  valid_from: string;
  valid_to: string;
  product_id: string;
  product_name: string;
  description: string;
  price: number;
  discounted_price: number;
  stock_quantity: number;
  category: string;
  image_url: string;
};
