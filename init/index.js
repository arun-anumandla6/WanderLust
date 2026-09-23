const mongoose=require("mongoose");
const initdata=require("./data");
const listing=require("../Models/listing");
async function main(){
    await mongoose.connect("mongodb://localhost:27017/wanderlust");
}
main()
.then(()=>{
    console.log("Connected to MongoDB");
}) .catch(err=>{
    console.log("Error connecting to MongoDB",err);
});
const initdb=async()=>{
    await listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({
        ...obj,
        owner:"6aa43a47cf01c22b7e793a11",

    }));
    await listing.insertMany(initdata.data);
    console.log("data was initialised");

}
initdb();