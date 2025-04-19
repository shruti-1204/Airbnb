    if(process.env.NODE_ENV !="production"){
        require("dotenv").config();
    }
    const express = require("express");
    const app = express();
    const mongoose = require("mongoose");
    const path = require("path");
    const methodOverride = require("method-override");
    const ejsMate = require('ejs-mate')
    const ExpressError = require("./utils/ExpressError.js");
    const MongoStore = require('connect-mongo');

    // const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

    const dbUrl = process.env.ATLASDB_URL;
    // const dbUrl ="mongodb+srv://wanderlust:wanderlust@cluster0.gqsakwh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

    const lisitngs = require("./routes/lisitngs.js")
    const reviews = require("./routes/reviews.js")
    const users = require("./routes/users.js")
    const session = require("express-session");
    const flash = require("connect-flash");
    const passport = require("passport")
    const LocalStrategy = require("passport-local")
    const User = require("./modules/user.js"); 

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname ,"views"))

    main()
        .then(() => {
            console.log("Connected to DB");
        })
        .catch((err) => {
            console.error("DB Connection Error:", err); // Fixed error logging
        });

    async function main() {
        await mongoose.connect(dbUrl);
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.engine("ejs", ejsMate)
    app.use(express.static(path.join(__dirname ,"/public")));

    const store = MongoStore.create(  {
        mongoUrl: dbUrl,
        crypto: {
            secret: 'mysupersecretcode'
          },
          touchAfter : 24 * 3600, 
    }  )

    store.on("error", () =>{
        console.log("Error is the mongo session store " ,err)
    })

    const sessionOption = {
        store,
        secret: "mysupersecretcode",
        resave: false,
        saveUninitialized: false, 
        cookie: {
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        }
    };
    

    // Root route
    app.get("/", (req, res) => {
        res.redirect("/listings");
    });

    app.use(session(sessionOption));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use((req, res, next )=>{
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
    });

    app.use("/listings", lisitngs);
    app.use("/listings/:id/review", reviews);
    app.use("/", users);

    app.all("*" ,(req , res, next)=>{
        next(new ExpressError (404,"Page not found")); 
    })

    app.use((err,req,res,next) =>{
        let {statusCode =500 , message= "Something went wrong"} = err;
    //     res.status(statusCode).send(message);
        res.status(statusCode).render("error.ejs" ,{ message })   
    })

    app.listen(8080, () => {
        console.log("Server is listening on port 8080");
    });
