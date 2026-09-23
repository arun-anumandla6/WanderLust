const Listing=require("../Models/listing.js")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}
module.exports.rendernewform=async (req,res)=>{
    res.render("listings/new.ejs");
}
module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id).populate({path:"reviews", populate:{path:"author"}});
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}
module.exports.createListing=async(req,res,next)=>{

    let response=await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send()
  

//   .then(response => {
//     const match = response.body;
//   });


    let url=req.file.path;
    let filename=req.file.filename;
    console.log(url,"..",filename);
    console.log(req.body);
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
    let savedlisting=await newListing.save();
    console.log(savedlisting);
    req.flash("success","New listing Created successfully")
    res.redirect("/listings");

}
module.exports.editListing=async (req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
    }
    let originalImageurl=listing.image.url;
    originalImageurl=originalImageurl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageurl});
}
module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    let updatedListing=req.body.listing;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename; 
        listing.image={url,filename};
        await listing.save(); 
    }

    req.flash("success","Listing updated successfully");
    res.redirect(`/listings/${id}`);
}
module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;    
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully");
    res.redirect("/listings");
}
module.exports.index = async (req, res) => {
    const { q } = req.query;
    let allListings;

    if (q && q.trim() !== "") {
        allListings = await Listing.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", {
        allListings,
        search: q
    });
};