const aws = require("aws-sdk")

require("dotenv").config();

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey
});

const uploadImage = (imagekey, buffer, content, callback) => {
  s3.upload({
    Bucket: bucketName,
    Key: imagekey,
    Body: buffer,
    ContentType: content }, (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
  })
}

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

module.exports = {s3, uploadImage, getS3ImageStream, deleteS3Image, deleteS3Images}