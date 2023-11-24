const mongoose = require("mongoose")


const AdminSchema = new mongoose.Schema(
    {
        ProfilePic:String,
        Name:String,
        Email:String,
        PhoneNumber:String,
        Password:String


    },
    {
        collection:"Admin"

    })

    const AdminModel = mongoose.model("AdminModel", AdminSchema);
    module.exports = AdminModel