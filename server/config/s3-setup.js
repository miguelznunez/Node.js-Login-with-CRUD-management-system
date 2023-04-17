const S3 = require("aws-sdk/clients/s3");
require("dotenv").config();

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
});

function getImageStream(imageKey){
  return s3.getObject({Bucket: bucketName, Key: imageKey}).createReadStream()
}

function deleteImage(imageKey){
  return s3.deleteObject({Bucket: bucketName, Key: imageKey}).promise()
}

module.exports = {s3, getImageStream, deleteImage}