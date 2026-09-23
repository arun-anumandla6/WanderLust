const express=require('express');
const router=express.Router();
const wrapasync = require("./utils/wrapasync.js");
const Expresserr = require("./utils/expresserr.js");
const {listingSchema}=require("../schema");
const Listing=require("../Models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer  = require('multer')
const {storage}=require("../cloud_config.js")
const upload = multer({ storage })

const listingcontroller=require("../controllers/listings.js");


router
.route("/")
.get(wrapasync(listingcontroller.index))
.post(isLoggedIn,
  upload.single('listing[image]'),
  validateListing,
wrapasync(listingcontroller.createListing)
);

//new route
router.get("/new",isLoggedIn,wrapasync(listingcontroller.rendernewform)
);


//show update and delete routes for a specific listing using the listing id
router
.route("/:id")
.get(wrapasync(listingcontroller.showListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapasync(listingcontroller.updateListing))
.delete(isLoggedIn,isOwner,wrapasync(listingcontroller.destroyListing));
//new route
// router.get("/new",isLoggedIn,wrapasync(listingcontroller.rendernewform)
// );

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapasync(listingcontroller.editListing));

module.exports=router;