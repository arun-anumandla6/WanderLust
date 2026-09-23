const Listing = require("./Models/listing");
const Expresserr = require("./routes/utils/expresserr.js");
const Reviews=require("./Models/review");
const { listingSchema, reviewSchema } = require("./schema");


// Login check
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
};

// Save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Owner check
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not authorized");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Listing validation
module.exports.validateListing = (req, res, next) => {
    if (!req.body || !req.body.listing) {
        throw new Expresserr(400, "Listing is required");
    }

    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new Expresserr(400, errMsg);
    }

    next();
};
//review validation


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new Expresserr(400, errMsg);
    }

    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId, id } = req.params;

    const review = await Reviews.findById(reviewId);

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};