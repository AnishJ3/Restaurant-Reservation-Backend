const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema(
    {
        Name:String, 
        MobNo:String,
        Date:String,
        Tables:Number,
        Slot:String
        
    },
    {
        collection:"Bookings"
    }
);

const BookingModel = mongoose.model("BookingModel", BookingSchema);

module.exports = BookingModel;