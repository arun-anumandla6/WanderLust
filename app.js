

require('dotenv').config()

console.log(`Hello ${process.env.SECRET}`)

const express=require("express");
const app=express();
const mongoose=require("mongoose");

//utils modules
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const dbUrl=process.env.ATLASDB_URL;
const Expresserr = require("./routes/utils/expresserr.js");
//Routing modules
const listingsrouter=require("./routes/listing.js");
const reviewsrouter=require("./routes/review.js");
const usersrouter=require("./routes/USER.JS");

//cookie and session modules
const cookieparse=require("cookie-parser");
const session=require("express-session");
const MongoStore = require("connect-mongo").default;
const flash=require("connect-flash");
//passport modules
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./Models/User");

// const Listing=require("./Models/listing");
// const Reviews=require("./Models/review");
// const wrapasync=require("./routes/utils/wrapasync.js");
// const {listingSchema,reviewschema}=require("./schema");

const store=MongoStore.create({
     mongoUrl:dbUrl,
     crypto:{
        secret:process.env.SECRET, 
     },
     touchAfter:24*3000,
});

store.on("error",()=>{
    console.log("ERRROR IN MONGO SESSION STORE",err)
})

app.use(cookieparse());
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {   
        expires: new Date(Date.now() + 7*24*60*60*1000),
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use (express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));


async function main(){
    await mongoose.connect(dbUrl);
}
main()
.then(()=>{
    console.log("Connected to MongoDB");
}) .catch(err=>{
    console.log("Error connecting to MongoDB",err);
});
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
// app.get("/demouser", async (req, res) => {
//         const fakeUser = new User({
//             email: "arun@gmail.com",
//             username: "arun",
//         });
//         const registeredUser = await User.register(fakeUser, "arun1234");
//         res.send(registeredUser);
// });
app.use("/listings",listingsrouter);
app.use("/listings/:id/reviews", reviewsrouter);
app.use("/", usersrouter);

// app.get("/",(req,res)=>{
//     res.send("Hello World");
// });
app.all("/*splat",(req,res,next)=>{
    next(new Expresserr(404,"Page Not Found"));
})
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("Error.ejs",{err});

});
app.listen(8080,()=>{
    console.log("Server is running on port 8080");
})

// Joi validation middleware
// const validateListing=(req,res,next)=>{
//     if(!req.body || !req.body.listing){
//         throw new Expresserr(400,"Listing is required");
//     }
//     let {error}=listingSchema.validate(req.body);
//     if(error){
//         let errMsg=error.details.map(el=>el.message).join(",");
//         throw new Expresserr(400,errMsg);
//     }
//     next();
// };
// const validateReview=(req,res,next)=>{
//     if(!req.body || !req.body.review){
//         throw new Expresserr(400,"Review is required");
//     }
//     let {error}=reviewschema.validate(req.body);
//     if(error){
//         let errMsg=error.details.map(el=>el.message).join(",");
//         throw new Expresserr(400,errMsg);
//     }
//     next();
// };


//index route
// app.get("/listings",async (req,res)=>{
//     let allListings=await Listing.find({});
//     res.render("listings/index.ejs",{allListings});
// });
// //new route
// app.get("/listings/new",async (req,res)=>{
//     res.render("listings/new.ejs");
// });

// //show route to read
// app.get("/listings/:id",wrapasync(async (req,res)=>{
//     let {id}=req.params;
//     const listing =await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{listing});
// })) 

// //create route
// // Create Route
// app.post("/listings",validateListing,
// wrapasync(async(req,res,next)=>{
//     console.log(req.body);
//     const newListing=new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");

// })
// );
// //edit route
// app.get("/listings/:id/edit",wrapasync(async (req,res)=>{
//     let {id}=req.params;
//     const listing =await Listing.findById(id);
//     res.render("listings/edit.ejs",{listing});
// }));
// //update route
// app.put("/listings/:id",
//     validateListing,
//     wrapasync(async (req,res)=>{
//     let {id}=req.params;
//     let updatedListing=req.body.listing;
//     await Listing.findByIdAndUpdate(id,updatedListing);
//     res.redirect(`/listings/${id}`);
// }));
// //delete route
// app.delete("/listings/:id",wrapasync(async (req,res)=>{
//     let {id}=req.params;    
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// })); 
//reviews
// app.post("/listings/:id/reviews",validateReview,wrapasync(async(req,res)=>{
//     let listing=await Listing.findById(req.params.id);
//     let newreview=new Reviews(req.body.review);
//     listing.reviews.push(newreview);
//     console.log("new review saved");
//     // res.send("Review added successfully");
//     await newreview.save();
//     await listing.save();
//     res.redirect(`/listings/${listing._id}`);
// }));
// //delete review route
// app.delete("/listings/:id/reviews/:reviewId",wrapasync(async(req,res)=>{
//     let {id,reviewId}=req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Listing.findById(reviewId);
//     res.redirect(`/listings/${id}`);
// }))

