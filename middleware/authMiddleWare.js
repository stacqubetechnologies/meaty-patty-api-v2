require('dotenv').config(); 
const jwt = require('jsonwebtoken'); 
exports.authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
        console.log(err)
      res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
  };
  