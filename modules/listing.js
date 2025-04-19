const mongoose = require("mongoose");
const { listingSchema } = require("../schema");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const ListingSchema = new Schema({
    title: {
        type: String,
        required: true, // Corrected "require" to "required"
    },
    description:{
        type: String
    },


    image: {
        type: Object,
        default: { url: "https://unsplash.com/photos/default-image-url" },
        set: (v) => (typeof v === "string" ? { url: v } : v), // Convert string to object
        validate: {
            validator: (v) => typeof v === "object" && v.url,
            message: "Image must be an object with a 'url' property.",
        },
    },
    

    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
    reviews:[{
        type: Schema.Types.ObjectId,
        ref:"Review"
    }]
});


ListingSchema.post("findOneAndDelete" , async(listing) =>{
        if(listing){
            await Review.deleteMany({_id :{ $in: listing.reviews}})
        }
});

const Listing = mongoose.model("Listing", ListingSchema); // Corrected capitalization
module.exports = Listing;
