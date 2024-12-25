const dotenv = require('dotenv')
const app = require('./app')

// Load the environment variables from the .env file
dotenv.config()

// Get the port from environment variables, defaulting to 3000 if not provided
const PORT = process.env.PORT || 3000

// Start the server
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || 'development'
    } mode`
  )
})
