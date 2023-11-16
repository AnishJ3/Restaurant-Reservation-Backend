
const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = (req, res, next) =>{

    const token = req.cookies.token;

    if(!token)
    {
        return res.status(401).json({message:"Unauthorized: No token provided"})
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if(err)
            return res.status(401).json({
        message:'Invalid Token'
        })

        req.id = decoded.id;
        next();
    })

}

module.exports = verifyToken;