const { kStringMaxLength } = require('buffer')
const mongoose = require('mongoose')

const UsersSchema = mongoose.Schema(
    {
        ProfilePic:String,
        Name:String,
        Email:String,
        PhoneNumber:String,
        Password:String

    },
    {
        collection: "Users"
    }
)

const UsersModel = mongoose.model("UsersModel", UsersSchema);
module.exports = UsersModel;