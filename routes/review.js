const express=require('express');
const router=express.Router({mergeParams:true});
const wrapasync=require("./utils/wrapasync.js");
const Expresserr=require("./utils/expresserr.js");
const Listing=require("../Models/listing");
const Reviews = require("../Models/review");
const { trusted } = require('mongoose');
const { isLoggedIn, validateReview , isReviewAuthor} = require("../middleware.js");
const reviewcontroller=require("../controllers/review.js");


//create review
router.post("/",isLoggedIn,validateReview,wrapasync(reviewcontroller.createReview));
//delete review route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor,wrapasync(reviewcontroller.destroyReview));

module.exports=router;