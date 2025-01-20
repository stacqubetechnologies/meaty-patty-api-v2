require("dotenv").config();

const { Client } = require("appwrite");

const client = new Client();

// client
//   .setEndpoint("https://cloud.appwrite.io/v1")
//   .setProject("6743e38c000f4322a927");

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("678bfb420012f6786668");

module.exports = {
  client,
  apiKey:
    "standard_6f9b18a21c27ca65b1c380a2f59c5314d1c7f97e544cf0a466fe7e0af241a58433b4ba51b4671aeea9c652e750fcb91ef6b3019716ce0e335d885ef7f8a4f0d7bd3b25be844c0da672e0e9fa7958b99ac8f1d6350bfadf163f65042c6f457148fa539dcae450c3e825284a0fd2a0df46b51961272447d9b4a9eaa24e57a59aeb",
};
