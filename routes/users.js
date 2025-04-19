const express = require("express");
const router = express.Router();
const User = require("../modules/user.js"); 
passport = require("passport")

    router.get("/signup" ,(req,res) =>{
        res.render("users/signup.ejs")
    })

    router.post("/signup", async (req, res, next) => {
        try {
            let { username, email, password } = req.body;
            const newUser = new User({ email, username });
            const registeredUser = await User.register(newUser, password);
    
            // 🛠️ Fix: Move everything inside the callback
            req.logIn(registeredUser, (err) => {
                if (err) {
                    return next(err);
                }
                req.flash("success", "Welcome to wanderlust!");
                res.redirect("/listings");
            });
    
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/signup");
        }
    });
    



    router.get("/login" ,(req,res) =>{
        res.render("users/login.ejs")
    })


    router.post('/login', 
        passport.authenticate('local', { failureRedirect: '/login' , failureFlash : true     }),
        async(req, res) =>{
          req.flash("success" , "Welcome to wanderlust!");
          res.redirect("/listings")
        });

    
        router.get("/logout" ,(req,res ,next) =>{
           req.logOut((err) =>{
            if(err) {
                next(err);
            }
            req.flash("success" , "You are sucessfully logged out");
            res.redirect("/listings")
           })
        })
    

module.exports= router;