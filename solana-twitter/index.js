const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

AWS.config.update({
  accessKeyId: "AKIA2AZX2MVO5OSYH2XD",
  secretAccessKey: "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",
});

//configuring the AWS environment

var s3 = new AWS.S3();
var filePath = "./target/idl/solana_twitter.json";

//configuring parameters
var params = {
  Bucket: "idl-files",
  Body: fs.createReadStream(filePath),
  Key: "folder/" + Date.now() + "_" + path.basename(filePath),
};

s3.upload(params, function (err, data) {
  //handle error
  if (err) {
    console.log("Error", err);
  }

  //success
  if (data) {
    console.log("Uploaded in:", data.Location);
  }
});

app.get("/", (req, res) => {
  res.send("hi");
});
app.listen(8080, () => {
  console.log("server listening on port 8080");
});
