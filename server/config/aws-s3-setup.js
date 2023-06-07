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

const getS3ImageStream = (imageKey) => {
  return s3.getObject({Bucket: bucketName, Key: imageKey}).createReadStream()
}

const deleteS3Image = (imageKey, callback) => {
  s3.deleteObject({
    Bucket: bucketName,
    Key: imageKey }, (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
  })
}

const deleteS3Images = (imageKeys, callback) => {
  s3.deleteObjects({
    Bucket: bucketName,
    Delete: { Objects: imageKeys, Quiet:false }}, (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
  })
}

module.exports = {s3, getS3ImageStream, deleteS3Image, deleteS3Images}