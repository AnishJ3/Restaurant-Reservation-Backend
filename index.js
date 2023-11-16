const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const RestaurantModel = require('./models/Restaurant')
const BookingModel = require('./models/Booking')
const SlotsModel = require('./models/Slots')
const UsersModel = require('./models/Users')
const bcrypt = require('bcrypt')
const app = express()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const verifyToken = require('./middleware/authMiddleware')
app.use(cookieParser())
app.use(express.json())
app.use(cors())



mongoose.connect('mongodb+srv://anish:12345@cluster0.l1hrlzw.mongodb.net/Restuarants')

app.listen(3000, () => {
    console.log("Server is running")
})
var db = mongoose.connection;
mongoose.set('strictQuery', true);

db.on("open", () => console.log("Connected to DB"));
db.on("error", () => console.log("Error occurred"));


app.get('/restaurants/:id', (req, res) => {

    var id = req.params.id;

    RestaurantModel.findOne({ _id: id })
        .then((data) => {
            if (data)
                res.json(data)
            else
                res.json("no data")
        })
        .catch((err) => res.json(err))
})


app.post('/newSlot', (req, res) => {

    SlotsModel.create(req.body)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

app.put('/bookSlot', (req, res) => {

    const rId = req.body.R_ID;
    const day = req.body.Day;
    const slot = req.body.Slot;
    const Name = req.body.Name;
    const MobNo =req.body.MobNo;
    const tables = parseInt(req.body.Tables);

    const updateQuery = {
        $inc: {
            [`Slots.Day${day}.${slot}.free`]: -tables,
            [`Slots.Day${day}.${slot}.booked`]: tables
        }
    };

    SlotsModel.findOneAndUpdate({ R_ID: rId }, updateQuery)
        .then((slot) => {
            if(slot)
            {

            }
            else
            {
                res.json("Slot not found")
            }
        })
        .catch(err => res.json(err.message));

    BookingModel.create({
        
            Name,
            MobNo,
            Date:day,
            Tables:tables,
            Slot:slot
    })
    .then((booking) =>{
        if(booking)
        {
            res.status(200).json("Successfull Booking")
        }
        else
        {
            res.json("Could not create a booking")
        }
    })
    
});



app.post('/updateReview', (req, res) => {

    var id = req.body.id;
    var review = req.body.review;
    
    RestaurantModel.updateOne({ _id: id },
        {
            $push: { Reviews: review }
        })
        .then((result) => {
            if (result) {
                res.json(result);
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json("Internal Server Error");
        });
})

app.get('/restaurants', verifyToken , (req, res) => {

    RestaurantModel.find()
        .then((data) => {
            if (data)
                res.json(data)
            else
                res.json('error')
        })
        .catch(err => res.json(err))
})


app.post('/newRestaurant', (req, res) => {

    RestaurantModel.create(req.body)
        .then((result) => res.json(result))
        .catch((err) => res.json(err))
})

app.post('/filterCategory', (req, res) => {

    var category = req.body.category;
    var cuisine = req.body.cuisine;
    var price = req.body.price;
    var query = {};
    var sort = req.body.sort; var city = req.body.city;
    var sortOptions = {}

    if (sort === 'Ratings') {
        sortOptions.Ratings = -1;

    }
    if (sort === 'Price') {
        sortOptions.AvgPrice = 1;
    }

    if (category.length > 0) {
        query.Category = { $all: category };
    }

    if (cuisine.length > 0) {
        query.Cuisine = { $all: cuisine };
    }

    if (city) {
        query.City = city;
    }
    if (price != undefined) {
        query.AvgPrice = { $lt: price }
    }

    RestaurantModel.find(query)
        .sort(sortOptions)
        // RestaurantModel.find({ $and: [{Category: {$in:category}}, {Cuisine:{$in:cuisine}}] })
        .then((data) => {
            if (data)
                res.json(data)
            else
                res.json("No data found")
        })
        .catch((err) => res.json(err))

})






app.post('/register', async (req, res) => {

    const { Name, Email, PhoneNumber, Password } = req.body;

    if (!(Name && Email && PhoneNumber && Password)) {
        res.status(400).json("All fields required")
    }

    UsersModel.findOne({ Email })
        .then((user) => {
            if (user) {
                res.status(400).json("User already exists with this email")
            }
        })

    const EncPassword = await bcrypt.hash(Password, 10);

    UsersModel.create({
        Name,
        Email,
        PhoneNumber,
        Password: EncPassword
    })
        .then((user) => {
            if (user)
                res.json(user)
            else {
                res.json("No User created")
            }

        })


})
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Enter all fields"); // Change status code to 400 for a bad request
        }

        const user = await UsersModel.findOne({ Email: email });

        if (user && (await bcrypt.compare(password, user.Password))) {
            const token = jwt.sign(
                {
                    id: user._id
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "2h"
                }
            );

            // Send token in user cookies

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Corrected typo 'Data.now()' to 'Date.now()'
                httpOnly: true
            };

            res.status(200).cookie("token", token, options).json(
                {
                    success: true,
                    token,
                    user
                }
            );
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


app.post('/logout', (req, res) =>{
    const token = req.cookies.token;

    if(!token)
    {
        return res.status(400).json({
            message:'Bad Request. Token not provided'
        })
    }

    // clearing the cookies

    res.clearCookie('token').json({
        message:"Logged out Successfully"
    })
})