const mongoose = require("mongoose");
const Listing = require("../modules/listing.js"); 
const initdata = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.error("DB Connection Error:", err); // Fixed error logging
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDb = async ()=> {
    await Listing.deleteMany({}); 
    await Listing.insertMany(initdata.data);
    console.log("Data is inserted")
}

initDb();
