const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema(
    {
        UserId:String,
        R_ID:String,
        RName:String,
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