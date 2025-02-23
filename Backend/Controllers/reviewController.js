import fs from "fs";
import csvParser from "csv-parser";
import {Review} from "../Models/reviewSchema.js";
// import autoTagReview from "../utils/autoTagging.js";




import {autoTagReview} from "../utils/autoTagging.js";

/**
 * Uploads reviews from CSV and auto-tags them
 */
export const uploadCsV = async (req, res) => {
  try {
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (data) => {
        const autoTags = autoTagReview(data["Review Text"], Number(data["Delivery Time (min)"]), data["Order Accuracy"]);

        results.push({
          agentName: data["Agent Name"],
          rating: Number(data["Rating"]),
          reviewText: data["Review Text"],
          deliveryTime: Number(data["Delivery Time (min)"]),
          location: data["Location"],
          orderType: data["Order Type"],
          customerFeedbackType: data["Customer Feedback Type"],
          priceRange: data["Price Range"],
          discountApplied: data["Discount Applied"] === "Yes",
          productAvailability: data["Product Availability"],
          customerServiceRating: Number(data["Customer Service Rating"]),
          orderAccuracy: data["Order Accuracy"],
          ...autoTags, // Auto-tagged fields 
        });
      })
      .on("end", async () => {
        await Review.insertMany(results);
        fs.unlinkSync(req.file.path);
        res.json({ message: "CSV uploaded and auto-tagged successfully!" });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const calculateMetrics = (data) => {
  // 1. Location Ratings
  const locationRatings = data.reduce((acc, order) => {
    if (!acc[order.location]) {
      acc[order.location] = { total: 0, count: 0 };
    }
    acc[order.location].total += order.rating;
    acc[order.location].count++;
    return acc;
  }, {});

  // 2. Agent Performance
  const agentPerformance = data.reduce((acc, order) => {
    if (!acc[order.agentName]) {
      acc[order.agentName] = { total: 0, count: 0 };
    }
    acc[order.agentName].total += order.rating;
    acc[order.agentName].count++;
    return acc;
  }, {});

  // 3. Price Ranges
  const priceRangeOrders = data.reduce((acc, order) => {
    const range = order.priceRange || 'Unknown';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {});

  // 4. Discount Distribution
  const discountDistribution = data.reduce((acc, order) => {
    const range = order.discountRange || 'No Discount';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {});

  // 5. Complaint Analysis
  const complaints = data.filter(order => 
    order.customerFeedbackType === 'Negative' && order.reviewText
  );
  
  const commonComplaints = complaints.reduce((acc, complaint) => {
    const type = complaint.complaintType || 'General Complaint';
    if (!acc[type]) {
      acc[type] = { count: 0, examples: [] };
    }
    acc[type].count++;
    if (acc[type].examples.length < 2) {
      acc[type].examples.push(complaint.reviewText.substring(0, 50) + '...');
    }
    return acc;
  }, {});

  return {
    totalOrders: data.length,
    averageRating: data.reduce((sum, order) => sum + order.rating, 0) / data.length,
    activeAgents: new Set(data.map(order => order.agentName)).size,
    avgRatingsPerLocation: Object.entries(locationRatings).map(([location, stats]) => ({
      location,
      avgRating: Number((stats.total / stats.count).toFixed(1))
    })),
    topAgents: Object.entries(agentPerformance)
      .sort((a, b) => (b[1].total/b[1].count) - (a[1].total/a[1].count))
      .slice(0, 3)
      .map(([agentName, stats]) => ({
        agentName,
        rating: Number((stats.total / stats.count).toFixed(1))
      })),
    bottomAgents: Object.entries(agentPerformance)
      .sort((a, b) => (a[1].total/a[1].count) - (b[1].total/b[1].count))
      .slice(0, 3)
      .map(([agentName, stats]) => ({
        agentName,
        rating: Number((stats.total / stats.count).toFixed(1))
      })),
    complaints: complaints.length,
    priceRangeOrders: Object.entries(priceRangeOrders)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .reduce((acc, [range, count]) => {
        acc[range] = count;
        return acc;
      }, {}),
    discountDistribution: Object.entries(discountDistribution)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((acc, [range, count]) => {
        acc[range] = count;
        return acc;
      }, {}),
    commonComplaints: Object.entries(commonComplaints)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([type, data]) => ({
        type,
        count: data.count,
        example: data.examples[0]
      }))
  };
};

export const fetchDashboardMetrics = async (req, res) => {
  try {
    const { location, orderType, serviceRating } = req.query;
    
    const filter = {};
    if (location) filter.location = location;
    if (orderType) filter.orderType = orderType;
    if (serviceRating) filter.customerServiceRating = Number(serviceRating);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    const metrics = calculateMetrics(data);

    res.status(200).json({
      success: true,
      data: {
        ...metrics,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics',
      details: error.message
    });
  }
};






// Configuration
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt'];
const ALLOWED_UPDATE_FIELDS = ['sentiment', 'accuracy', 'performance', 'customerFeedbackType'];
const VALIDATION_RULES = {
  sentiment: ['Positive', 'Neutral', 'Negative'],
  accuracy: ['Order Accurate', 'Incorrect'],
  performance: ['Fast', 'Average', 'Slow'],
  customerFeedbackType: ['Positive', 'Neutral', 'Negative']
};

export const allReviews = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = ALLOWED_SORT_FIELDS.includes(req.query.sort) 
      ? req.query.sort 
      : 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    // Query construction
    const query = {};
    // Add any filter conditions here if needed

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .select('agentName reviewText sentiment accuracy performance customerFeedbackType createdAt')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query)
    ]);

    const response = {
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total
      },
      message: reviews.length 
        ? 'Reviews retrieved successfully' 
        : 'No reviews found'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching reviews',
      details: error.message
    });
  }
};

export const updateReviewTags = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('hellow')
    
    // Filter allowed fields
    const updateFields = Object.keys(req.body)
      .filter(key => ALLOWED_UPDATE_FIELDS.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Validation
    const validationErrors = [];
    Object.entries(updateFields).forEach(([field, value]) => {
      if (VALIDATION_RULES[field] && !VALIDATION_RULES[field].includes(value)) {
        validationErrors.push(`Invalid value '${value}' for field '${field}'`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review tags updated successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Error updating review:', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.name === 'ValidationError' 
        ? 'Validation failed' 
        : 'Server error while updating review',
      details: error.message
    });
  }
};