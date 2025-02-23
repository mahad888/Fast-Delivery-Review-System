import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  agentName: String,
  rating: Number,
  reviewText: String,
  deliveryTime: Number, 
  location: String,
  orderType: String, 
  customerFeedbackType: String, 
  priceRange: String, 
  discountApplied: Boolean,
  productAvailability: String, 
  customerServiceRating: Number, 
  orderAccuracy: String, 
  sentiment: String, 
  deliverySpeed: String, 
  createdAt: { type: Date, default: Date.now }, 
  sentiment: { type: String, enum: ["Positive", "Neutral", "Negative"], default: "Neutral" },
  performance: { type: String, enum: ["Fast", "Average", "Slow"], default: "Average" },
  accuracy: { type: String, enum: ["Order Accurate", "Incorrect"], default: "Order Accurate" }

});

export const Review = mongoose.model("Review", reviewSchema);
