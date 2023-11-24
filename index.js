const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const RestaurantModel = require('./models/Restaurant')
const BookingModel = require('./models/Booking')
const SlotsModel = require('./models/Slots')
const UsersModel = require('./models/Users')
const AdminModel = require('./models/Admin')
const bcrypt = require('bcrypt')
const app = express()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const verifyToken = require('./middleware/authMiddleware')
app.use(cookieParser())
app.use(
    cors({
        origin: 'http://localhost:3001', // Adjust the origin to match your frontend URL
        credentials: true,
    })
);
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


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
                res.status(200).json(data)
            else
                res.status(401).json("no data")
        })
        .catch((err) => res.json(err))
})


app.post('/newSlot', (req, res) => {

    SlotsModel.create(req.body)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})
app.post('/bookSlot', verifyToken, async (req, res) => {
    const rId = req.body.R_ID;
    const day = req.body.Day;
    const slot = req.body.Slot;
    const userID = req.id;
    const tables = parseInt(req.body.Tables);
    const RName = req.body.RName;

    const existingBooking = await BookingModel.findOne({
        UserId: userID,
        Slot: slot,
        Date: day
    });

    if (existingBooking) {
        return res.json("Booking already exists for the slot and day");
    }

    const currentSlot = await SlotsModel.findOne({ R_ID: rId });

    if (!currentSlot || !currentSlot.Slots || !currentSlot.Slots[day] || !currentSlot.Slots[day][slot]) {
        return res.json("Slot not found");
    }

    const availableFreeTables = currentSlot.Slots[day][slot].free;

    // Check if there are enough available free tables
    if (availableFreeTables < tables) {
        return res.json("Not enough available tables for booking");
    }

    const updateQuery = {
        $inc: {
            [`Slots.${day}.${slot}.free`]: -tables,
            [`Slots.${day}.${slot}.booked`]: tables
        }
    };

    SlotsModel.findOneAndUpdate({ R_ID: rId }, updateQuery, { new: true })
        .then((updatedSlot) => {
            if (updatedSlot) {
                BookingModel.create({
                    UserId: userID,
                    R_ID: rId,
                    RName,
                    Date: day,
                    Tables: tables,
                    Slot: slot
                })
                    .then((booking) => {
                        if (booking) {
                            res.status(200).json("Successful Booking");
                        } else {
                            res.json("Could not create a booking");
                        }
                    })
                    .catch((err) => res.json(err));
            } else {
                res.json("Slot not found");
            }
        })
        .catch(err => res.json(err.message));
});



app.post('/updateReview', verifyToken, async (req, res) => {

    var id = req.id;
    var rID = req.body.rid;
    var rating = req.body.rating;
    var new_rating = req.body.newRating
    var comment = req.body.comment;
    var user = await UsersModel.findOne({ _id: id })
    var name = user.Name;
    var pic = user.ProfilePic;

    var review = {
        UserPic: pic,
        Name: name,
        Ratings: rating,
        Comment: comment
    }

    RestaurantModel.updateOne({ _id: rID },
        {
            $push: { Reviews: review },
            $set:{Ratings:new_rating},
        })
        .then((result) => {
            if (result) {
                res.status(200).json(result);
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json("Internal Server Error");
        });
})

app.get('/restaurants', (req, res) => {

    RestaurantModel.find()
        .then((data) => {
            if (data)
                res.json(data)
            else
                res.json('error')
        })
        .catch(err => res.json(err))
})


app.post('/newRestaurant', verifyToken, async (req, res) => {

    try {


        var id = req.id;
        const { Name, City, Address, Images, About, MobNumber, Category,
            Cuisine, AvgPrice } = req.body;
        const restaurant = await RestaurantModel.create({
            Name,
            City,
            Address,
            Images,
            Ratings:0,
            AdminId: id,
            About,
            MobNumber,
            Category,
            Cuisine,
            AvgPrice

        })
        SlotsModel.create({
            R_ID: restaurant._id,
            Slots: {

                "2023-11-25": {
                    breakfast: {
                        free: 30,
                        booked: 0
                    },
                    lunch: {
                        free: 30,
                        booked: 0
                    },
                    dinner: {
                        free: 30,
                        booked: 0
                    }
                },
                "2023-11-26": {
                    breakfast: {
                        free: 30,
                        booked: 0
                    },
                    lunch: {
                        free: 30,
                        booked: 0
                    },
                    dinner: {
                        free: 30,
                        booked: 0
                    }
                },
                "2023-11-27": {
                    breakfast: {
                        free: 30,
                        booked: 0
                    },
                    lunch: {
                        free: 30,
                        booked: 0
                    },
                    dinner: {
                        free: 30,
                        booked: 0
                    }
                },
                "2023-11-28": {
                    breakfast: {
                        free: 30,
                        booked: 0
                    },
                    lunch: {
                        free: 30,
                        booked: 0
                    },
                    dinner: {
                        free: 30,
                        booked: 0
                    }
                },
                "2023-11-29": {
                    breakfast: {
                        free: 30,
                        booked: 0
                    },
                    lunch: {
                        free: 30,
                        booked: 0
                    },
                    dinner: {
                        free: 30,
                        booked: 0
                    }
                },
                "2023-11-30": {
                    breakfast: {
                        free: 30,
                        booked: 0
                    },
                    lunch: {
                        free: 30,
                        booked: 0
                    },
                    dinner: {
                        free: 30,
                        booked: 0
                    }
                },
                "2023-11-31": {
                    breakfast: {
                        free: 30,
                        booked: 0
                    },
                    lunch: {
                        free: 30,
                        booked: 0
                    },
                    dinner: {
                        free: 30,
                        booked: 0
                    }
                }
            }
        }
        )

        res.status(200).json({
            success: true,
            message: 'Restaurant and slots created successfully',
            restaurant
        });
    }
    catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }





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

    const { name, email, phone, password, confirmPassword } = req.body;

    if (!(name && email && phone && password)) {
        res.status(400).json("All fields required")
    }
    UsersModel.findOne({ Email: email })
        .then((user) => {
            if (user) {
                res.status(400).json("User already exists with this email")
            }
        })

    const EncPassword = await bcrypt.hash(password, 10);

    UsersModel.create({
        ProfilePic: "",
        Name: name,
        Email: email,
        PhoneNumber: phone,
        Password: EncPassword
    })
        .then((user) => {
            if (user)
                res.status(200).json(user)
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

        if (!(await bcrypt.compare(password, user.Password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }


        if (user) {
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
                httpOnly: true,
                secure: true,
                sameSite: "none"


            };

            res.status(200).cookie("token", token, options).json(
                {
                    success: true,
                    token,
                    user
                }
            );
        }
        else {
            res.status(405).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


app.put('/clearPastBookings', verifyToken, async (req, res) => {
    try {
        // Get the current date
        const currentDate = new Date();

        // Find bookings with a date earlier than the current date
        const pastBookings = await BookingModel.find({ UserId: req.id, Date: { $lt: currentDate.toISOString() } });

        // Delete past bookings
        const result = await BookingModel.deleteMany({ UserId: req.id, Date: { $lt: currentDate.toISOString() } });

        // Respond with a success message or any relevant information
        res.status(200).json({
            success: true,
            message: 'Past bookings cleared successfully',
            deletedCount: result.deletedCount,
            pastBookings: pastBookings,
        });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


app.post('/adminSignup', (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!(name && email && phone && password)) {
            return res.status(400).json("All fields required")
        }
        AdminModel.findOne({ Email: email })
            .then((admin) => {
                if (admin) {
                    res.status(402).json("Admin already exists with this email")
                }
            })

        AdminModel.create({
            ProfilePic: "",
            Name: name,
            Email: email,
            PhoneNumber: phone,
            Password: password
        })
            .then((admin) => {
                if (admin)
                    res.status(200).json(admin)
                else {
                    res.status(401).json("No User created")
                }

            })



    }
    catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: "Internal Server Error" });

    }
})


app.post('/adminLogin', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Enter all fields"); // Change status code to 400 for a bad request
        }

        const admin = await AdminModel.findOne({ Email: email });

        if (admin && admin.Password === password) {
            const token = jwt.sign(
                {
                    id: admin._id
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "2h"
                }
            );

            // Send token in user cookies

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Corrected typo 'Data.now()' to 'Date.now()'
                httpOnly: true,
                secure: true,
                sameSite: "none"
            };

            res.status(200).cookie("token", token, options).json(
                {
                    success: true,
                    token,
                    admin
                }
            );
        }
        else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    }

    catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });

    }

})

app.post('/logout', async(req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(400).json({
            message: 'Bad Request. Token not provided'
        })
    }

    // clearing the cookies

    return await res.clearCookie('token',{path:'/'}).status(200).json({
        message: "Logged out Successfully"
    })
})

app.post('/user', verifyToken, (req, res) => {
    UsersModel.findOne({ _id: req.id })
        .then((user) => {
            if (user) {
                res.status(200).json(user)
            }
            else {
                res.status(404).json("No user found")
            }
        })
        .catch((err) => res.json(err))
})

app.post('/admin', verifyToken, (req, res) => {
    AdminModel.findOne({ _id: req.id })
        .then((admin) => {
            if (admin) {

                res.status(200).json(admin)
            }
            else {
                res.status(402).json("No admin found")
            }
        }).catch((err) => res.json(err))
})

app.post('/update', verifyToken, (req, res) => {
    var id = req.id;
    UsersModel.updateOne({ _id: id },
        {
            $set: req.body
        })
        .then((data) => {
            if (data) {
                res.json(data)
            }
            else {
                res.json("Not Found User")
            }
        })
        .catch((err) => console.log(err))
})

app.post('/updateAdmin', verifyToken, (req, res) => {
    var id = req.id;
    AdminModel.updateOne({ _id: id },
        {
            $set: req.body
        })
        .then((data) => {
            if (data) {
                res.status(200).json(data)
            }
            else {
                res.json("Not Found User")
            }
        })
        .catch((err) => console.log(err))
})



app.get('/getBookings', verifyToken, (req, res) => {
    BookingModel.find({ UserId: req.id })
        .then((booking) => {
            if (booking) {
                res.json(booking)
            }
            else {
                res.json("No booking found")
            }
        })
        .catch((err) => res.json(err))
})

app.post('/cancelBooking', (req, res) => {

    var id = req.body.bid;

    BookingModel.findByIdAndDelete({ _id: id })
        .then((booking) => {
            if (booking) {
                res.status(200).json("Booking successfully deleted")
            }
        })
        .catch(err => res.json(err))
})

app.get('/findRestaurantAdmin', verifyToken, (req, res) => {

    RestaurantModel.find({ AdminId: req.id })
        .then((rest) => {
            if (rest) {
                res.status(200).json(rest)
            }
            else {
                res.json("No restaurant found");
            }
        })
        .catch((err) => console.log(err))


})

app.get('/getBookingDetails/:id', (req, res) => {

    var id = req.params.id;

    BookingModel.find({ R_ID: id })
        .then((booking) => {
            if (booking) {
                res.status(200).json(booking)
            }
            else {
                res.json("No booking for this restaurant")
            }
        })
        .catch(err => console.log(err))

})

app.get("/user/:id", (req, res) => {

    var id = req.params.id;

    UsersModel.findOne({ _id: id })
        .then((user) => {
            if (user) {
                return res.status(200).json(user)
            }
            else {
                return res.json("No user found")
            }
        })
        .catch((err) => console.log(err))
})
