const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js")
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js") 
const Listing = require("../modules/listing.js"); // Corrected the relative path
const { isLoggedIn } = require("../middleware.js")


//Server side validation 

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body); // Correct extraction

    if (error) { // Check if error exists
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }

    next();
};


//Index route
router.get("/", async(req,res)=>{
    let Listingdata = await Listing.find({});
    res.render("listings/index.ejs" , { Listingdata })
})

//New route for creating the new list 
router.get("/new", isLoggedIn,(req,res) =>{
    console.log(req.user)
    res.render("listings/new.ejs")
})

//Show route
router.get("/:id" ,wrapAsync(async(req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing you have requested for does not exists!");
         return res.redirect("/listings");
    }
    res.render("listings/show.ejs" , { listing })
}));


//Create route for adding the new lisitng in the database
router.post("/",validateListing, wrapAsync  (async(req,res,next)=>{
    let newlisting = new Listing(req.body.listing); 
    await newlisting.save();
    req.flash("success", "New Listing is Created");
    res.redirect("/listings")
}));

//Edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you have requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//update route
router.put("/:id", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing);
    if (!listing) {
        req.flash("error", "Listing you have requested for does not exist!");
        return res.redirect("/listings");
    }
    req.flash("success", "Listing is Updated");
    res.redirect(`/listings/${listing._id}`);
}));

//delete route
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing is Deleted");
    res.redirect("/listings/");
}));


module.exports = router;