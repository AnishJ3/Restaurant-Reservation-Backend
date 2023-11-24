
const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = (req, res, next) =>{

    const token = req.cookies.token;

    if(!token)
    {
        return res.status(401).json({message:"Unauthorized: No token provided"})
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Invalid token' });
            } else if (err instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: 'Token expired' });
            } else {
                return res.status(401).json({ message: 'Invalid token' });
            }
        }
    
        req.id = decoded.id;
        next();
    });

}

module.exports = verifyToken;