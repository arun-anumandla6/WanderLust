const mongoose=require("mongoose");
const Reviews=require("./review");
const schema=mongoose.Schema;

const listingschema = new schema({
    title: {
        type: String,
        required: true,
    },

    description: String,

    image: {
        url:String,
        filename:String,
    },

    price: Number,
    location: String,
    country: String,

    owner: {
        type: schema.Types.ObjectId,
        ref: "User",
    },

    reviews: [{
        type: schema.Types.ObjectId,
        ref: "Review",
    }],
    geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
//   category:{
//     type:String,
//     enum:["mountaons","arctics","farms","deserts"]
//   }
});
listingschema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Reviews.deleteMany({
            _id:{
                $in:listing.reviews
            }
        })
    }
});
module.exports =
  mongoose.models.Listing || mongoose.model("Listing", listingschema);