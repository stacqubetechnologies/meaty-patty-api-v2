const { Databases, Account, ID, Query } = require('appwrite')
const { client } = require('../config/appwrite')
const jwt = require('jsonwebtoken')
const sdk = require('node-appwrite')
require('dotenv').config()

const databases = new Databases(client)
const account = new Account(client)

exports.createUser = async (
  email,
  password,
  firstName,
  lastName,
  mobileNo,
  postalCode,
  houseAppart,
  city,
  street
) => {
  try {
    const user = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    )
    await databases.createDocument(
      '674c41e70028ef203de0',
      '674c432f000bc3cb992b',
      'unique()',
      {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        MobileNo: mobileNo, // Add +91 prefix to mobile number
        UserId: user.$id
      }
    )
    await databases.createDocument(
      '674c41e70028ef203de0',
      '674c433a0008c6609eb9',
      ID.unique(),
      {
        UserId: user.$id,
        PostalCode: postalCode,
        HouseAppart: houseAppart,
        City: city,
        Street: street
      }
    )
    return { success: true, user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
exports.loginUser = async (email, password) => {
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required.'
    }
  }

  try {
    const session = await account.createEmailPasswordSession(email, password)

    // Correct query format with single quotes around the userId value
    const userDetails = await databases.listDocuments(
      '674c41e70028ef203de0',
      '674c432f000bc3cb992b',
      [
        Query.limit(200) // Fetch up to 100 documents
      ]
    )

    const user = userDetails.documents.find(
      doc => doc.UserId === session.userId
    )
    console.log(user)

    const token = jwt.sign(
      {
        userId: session.userId,
        email: email,
        sessionId: session.$id,
        expiry: session.expire
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    return { success: true, token, session, user }
  } catch (error) {
    console.error('Login Error:', error)
    return {
      success: false,
      error: error.message || 'An error occurred during login.'
    }
  }
}

exports.validateSession = async () => {
  try {
    const session = await account.get()
    return { success: true, user: session }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

exports.addAddress = async (userId, postalCode, houseAppart, city, street) => {
  try {
    await databases.createDocument(
      '674c41e70028ef203de0',
      '674c433a0008c6609eb9',
      ID.unique(),
      {
        UserId: userId,
        PostalCode: postalCode,
        HouseAppart: houseAppart,
        City: city,
        Street: street
      },
    
    )
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

exports.listUserAddresses = async userId => {
  try {
    const addressList = await databases.listDocuments(
      '674c41e70028ef203de0', // Database ID
      '674c433a0008c6609eb9', // Collection ID for addresses
      [
        Query.limit(200) // Fetch up to 100 documents
      ]
    )

    // Filter the documents to only include those matching the given UserId
    const userAddresses = addressList.documents.filter(
      doc => doc.UserId === userId
    )

    return {
      success: true,
      addresses: userAddresses
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
