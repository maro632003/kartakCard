const { default: slugify } = require("slugify");
const placeModel = require("../model/placeModel");
const appError = require("../utils/dummy/apiError");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middleware/uploadImage");
const { cloudinaryUploadImage } = require("../utils/dummy/cloudinary");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { now } = require("mongoose");
const sharp = require("sharp");
const fs = require("fs");

const uploadImage = uploadSingleImage("imageCover");
const reasizeImage = asyncHandler(async (req, res, next) => {
  let fileName = `place-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    sharp(req.file.buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/place/${fileName}`);

    req.body.imageCover = fileName;
  }

  next();
});
const createPlace = asyncHandler(async (req, res, next) => {
  
  req.body.slug = slugify(req.body.name);
  //validetion if the place is already created
  const oldPlace = await placeModel.findOne({ name: req.body.name });

  if (oldPlace) {
    const error = new appError("place already exists !!", 400, "FAILED");
    return next(error);
  }

  // validation if admin uploud image 
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }

  //2.get the path to the image
  const imagePath = path.join(
    __dirname,
    `../uploads/place/${req.body.imageCover}`
  );
  //3.upload ro cloudinary
  const result = await cloudinaryUploadImage(imagePath); 
  
  //create object of new place to update (url,publicId)
  const newPlace = new placeModel(req.body);

//update (url,publicId)
  newPlace.cloudImage = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  const place = await placeModel.create(newPlace);
  place.save();
  res.status(200).json({ data: place });
   //8.Remove the photo from the server
   fs.unlinkSync(imagePath)
});

const getSpecificPlace = asyncHandler(async (req, res, next) => {
  const place = await placeModel.findById(req.params.id);
  if (!place) {
    res.status(400).json(`no place for this id ${req.params.id}`);
  }
  res.status(200).json({ data: place });
});

const getAllPlace = asyncHandler(async (req, res, next) => {
  const place = await placeModel.find();
  if (!place) {
    res.status(400).json(`there is no places`);
  }
  res
    .status(200)
    .json({ length: place.length, status: "success", data: place });
});

const DeletePlace = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const place = await placeModel.findByIdAndDelete(id);
  if (!place) {
    res.status(400).json(`no place for this id ${id}`);
  }
  res
    .status(200)
    .json({ length: place.length, status: "success", data: place });
});
const updatePlace = asyncHandler(async (req, res, next) => {
  const place = await placeModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  place.save();
  if (!place) {
    res.status(400).json(`no place for this id ${req.params.id}`);
  }
  res.status(200).json({ status: "success", data: place });
});

module.exports = {
  createPlace,
  uploadImage,
  reasizeImage,
  getSpecificPlace,
  getAllPlace,
  DeletePlace,
  updatePlace,
};
