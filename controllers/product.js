import { asyncError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandtler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";
import { Category } from "../models/category.js";

export const getAllProducts = asyncError(async (req, res, next) => {
  //search and category query
  const { keyword, category } = req.query;
  const products = await Product.find({
    name: {
      $regex: keyword ? keyword : "",
      $options: "i",
    },
    category: category ? category : undefined,
  });
  res.status(200).json({
    succcess: true,
    products,
  });
});
export const getProductDetails = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) return next(new ErrorHandtler("Product not found", 404));
  res.status(200).json({
    succcess: true,
    product,
  });
});
export const createProduct = asyncError(async (req, res, next) => {
  const { name, description, price, stock, category } = req.body;
  if (!req.file) return next(new ErrorHandtler("Please add image", 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  await Product.create({
    name,
    description,
    price,
    stock,
    category,
    images: [image],
  });

  res.status(200).json({
    succcess: true,
    message: "Product created Succesfully",
  });
});

//update product
export const updateProduct = asyncError(async (req, res, next) => {
  const { name, description, price, stock, category } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandtler("Product not found", 404));
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  res.status(200).json({
    succcess: true,
    message: "Product updated Succesfully",
  });
});
//Images
export const addProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandtler("Product not found", 404));
  if (!req.file) return next(new ErrorHandtler("Please add image", 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  product.images.push(image);
  await product.save();
  res.status(200).json({
    succcess: true,
    message: "Image added Succesfully",
  });
});
//delete Image
export const deleteProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandtler("Product not found", 404));
  const id = req.query.id;

  if (!id) return next(new ErrorHandtler("please enter image Id", 400));
  let isExsist = -1;
  product.images.forEach((item, index) => {
    if (item._id.toString() === id.toString()) isExsist = index;
  });
  if (isExsist < 0)
    return next(new ErrorHandtler("Image doesn't exsist!", 400));
  await cloudinary.v2.uploader.destroy(product.images[isExsist].public_id);

  product.images.splice(isExsist, 1);

  await product.save();

  //console.log(isExsist);

  res.status(200).json({
    succcess: true,
    message: "Image deleted Succesfully",
  });
});
export const deleteProduct = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandtler("Product not found", 404));
  for (let index = 0; index < product.images.length; index++) {
    await cloudinary.v2.uploader.destroy(product.images[index].public_id);
  }

  await product.remove();

  //console.log(isExsist);

  res.status(200).json({
    succcess: true,
    message: "Product deleted Succesfully",
  });
});

export const addCategory = asyncError(async (req, res, next) => {
  //const {category} = req.body;
  await Category.create(req.body);
  res.status(201).json({
    succcess: true,
    message: "Category added Succesfully",
  });
});
export const getAllCategories = asyncError(async (req, res, next) => {
  const categories = await Category.find({});
  res.status(200).json({
    succcess: true,
    categories,
  });
});
export const deleteCategory = asyncError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandtler("Category Not Found", 404));
  const products = await Product.find({ category: category._id });

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.category = undefined;
    await product.save();
  }
  await category.remove();

  res.status(200).json({
    succcess: true,
    message: "Category deleted succesfully",
  });
});
export const getAdminProducts = asyncError(async (req, res, next) => {
  //search and category query
  const products = await Product.find({}).populate("category");

  const outOfStock = products.filter((i) => i.stock === 0);

  res.status(200).json({
    succcess: true,
    products,
    outOfStock: outOfStock.length,
    inStock: products.length-outOfStock.length
  });
});
