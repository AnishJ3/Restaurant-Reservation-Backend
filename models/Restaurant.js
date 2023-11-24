const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema({
    UserPic:String,
    Name: String,
    Ratings: String,
    Comment: String
});

const RestaurantSchema = new mongoose.Schema({
    Name: String,
    City: String,
    Address: String,
    Images: Array,
    Ratings: Number,
    AdminId:String,
    Reviews: [ReviewSchema], // Array of reviews
    About: String,
    MobNumber: String,
    Menu: String,
    Category:Array,
    Cuisine:Array,
    AvgPrice:Number,
   
}, {
    collection: "restaurant"
});

const RestaurantModel = mongoose.model("RestaurantModel", RestaurantSchema);

module.exports = RestaurantModel;
