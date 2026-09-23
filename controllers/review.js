const Reviews=require("../Models/review.js");
const Listing=require("../Models/listing");
module.exports.createReview=async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newreview=new Reviews(req.body.review);
    newreview.author=req.user._id;
    listing.reviews.push(newreview);
    console.log(newreview);
    console.log("new review saved");
    // res.send("Review added successfully");
    await newreview.save();
    await listing.save();
    req.flash("success","New review added successfully");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Reviews.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted successfully");
    res.redirect(`/listings/${id}`);
}