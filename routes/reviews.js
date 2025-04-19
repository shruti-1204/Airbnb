const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapasync.js")
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js")
const Review = require("../modules/review.js");
const Listing = require("../modules/listing.js"); // Corrected the relative path


//Server side validation for reviews 

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); // Correct extraction

    if (error) { // Check if error exists
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }

    next();
}


//Review route
//Post
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    console.log(req.params.id)
    await newReview.save();  // Save the review first
    listing.reviews.push(newReview._id);
    await listing.save(); // Then save the listing

    req.flash("success", "New Review is Created");
    res.redirect(`/listings/${listing._id}`);
}));


//delete review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review is Deleted");
    res.redirect(`/listings/${id}`);    
}));


module.exports = router;