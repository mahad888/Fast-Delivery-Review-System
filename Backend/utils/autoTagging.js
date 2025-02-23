// const natural = require("natural");
import Sentiment from "sentiment"

const sentimentAnalyzer = new Sentiment();


export const autoTagReview = (reviewText, deliveryTime, orderAccuracy) => {
  
  const sentimentScore = sentimentAnalyzer.analyze(reviewText).score;
  let sentiment;
  if (sentimentScore > 2) sentiment = "Positive";
  else if (sentimentScore >= -2) sentiment = "Neutral";
  else sentiment = "Negative";


  let performance;
  if (deliveryTime <= 30) performance = "Fast";
  else if (deliveryTime <= 60) performance = "Average";
  else performance = "Slow";

  let accuracy = orderAccuracy.toLowerCase().includes("mistake")
    ? "Order Mistake"
    : "Order Accurate";

  return { sentiment, performance, accuracy };
};

