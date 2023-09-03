const { Category } = require("../models/category");
const validateMongodbId = require("../utils/validateMongodbId");
const Product = require("../models/products");
const asyncHandler = require("express-async-handler");

const postCategory = asyncHandler(async (req, res) => {
  // Get the category  from the request body
  const { title, title2, icon, quantity, productId } = req.body;
  validateMongodbId(productId);
  // Find or create the category object
  let category = await Category.findOne({ title, title2 });
  if (!category) {
    category = await Category.create({
      title,
      title2,
    });
  }

  // Update the product with the new category
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $push: {
        category: category._id,
      },
    },
    {
      new: true,
    }
  );

  console.log(product);

  // If the product does not exist, return an error
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Return a success message and the new category and availability
  res.status(201).json({
    success: true,
    category,
  });
});

// Update a category for a specific product
const updateCategory = asyncHandler(async (req, res) => {
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
    },
    {
      new: true,
    }
  );

  if (!updatedCategory) {
    return res.status(404).json({ message: "updatedcategory not found" });
  }

  // Return a success message and the updated category
  res.json({
    message: "Success",
    updatedCategory,
  });
});

// Delete a category for a specific product
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const product = await Product.findOne({ category: categoryId });

  if (!product) {
    return res.status(404).json({ message: "category not found" });
  }

  // Remove the categoryid from the category's array
  product.category.pull(categoryId);
  await product.save();

  // Delete the color itself
  await Category.findByIdAndDelete(categoryId);

  res.json({ message: "category deleted successfully" });
});

// Get all products categories
const getCategories = asyncHandler(async (req, res) => {
  // Find all categories for the specified product
  const categories = await Category.find().select("-__v");
  if (!categories) {
    return res.status(404).json({ message: "no categories founds" });
  }
  // Return the list of category
  res.status(200).json({ categories, message: "success" });
});

// Get a single category for specific product by ID
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).select("-__v");
  if (!category) {
    res.status(404).json({ message: "category not found" });
  }
  res.status(200).json({ category, message: "success" });
});

// Get a single category by matching both title1 and title2
const getCategoryByTitles = asyncHandler(async (req, res) => {
  const { title1, title2 } = req.body;

  if (!title1 || !title2) {
    return res.status(400).json({
      message: "Both title1 and title2 are required query parameters",
    });
  }

  const category = await Category.findOne({ title1, title2 }).select("-__v");

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json({ category, message: "Success" });
});

module.exports = {
  getCategories,
  getCategoryById,
  postCategory,
  deleteCategory,
  updateCategory,
  getCategoryByTitles,
};
