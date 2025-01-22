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
    "standard_09b66fc96613b9b025a80dde643c3fcbb2edc0a5c6a5c89f622ce9f656530e7742cfa27488ce43cf6b677dce505ae7ef9c93cc5bf4748e5249cdf36e007d25376182a48e9afa2bef88a2770ee6a820bded46e73d5c6a8d719dd493338c68bec5ba2da62789f976e7f04e6e1b271ee32cf83c313c6244fe4c164ddc19ae7dfead",
};
