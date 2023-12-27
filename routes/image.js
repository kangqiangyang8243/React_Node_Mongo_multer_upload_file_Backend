const mongoose = require('mongoose');
const router = require('express').Router();
const ImageModel = require('../models/ImageModel');
const MongoClient = require("mongodb").MongoClient
const GridFSBucket = require("mongodb").GridFSBucket


const dotenv = require("dotenv");
dotenv.config();




module.exports = (upload) => {


  const mongoClient = new MongoClient(process.env.mongoURI)


  router.route('/')
    .post(upload.single('file'), async (req, res) => {
      // return console.log(req.file, req.body);
      // check for existing images
      // Image.findOne({ caption: req.body.caption })
      //   .then((image) => {
      //     console.log(image);
      //     if (image) {
      //       return res.status(200).json({
      //         success: false,
      //         message: 'Image already exists',
      //       });
      //     }

      try {
        const newImage = await ImageModel.create({
          caption: req.body.caption,
          filename: req.file.filename,
          fileId: req.file.id,
          contentType: req.file.contentType
        });

        return res.status(200).json({
          success: true,
          newImage,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

    });


  // get all images
  router.get('/', async (req, res) => {
    try {
      await mongoClient.connect();
      const database = mongoClient.db("React_Mongo_upload")

      const images = database.collection("imagemodels");

      const cursor = images.find();

      const count = cursor.count();

      if (count === 0) {
        return res.status(404).send({
          message: "Error: No Image Found!"
        });
      }

      const allImages = [];

      await cursor.forEach(item => {
        allImages.push(item);
      })

      return res.status(200).json({
        success: true,
        allImages
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  })

  // get recent upload post
  router.route('/recent/').get(async (req, res) => {
    try {
      const image = await ImageModel.findOne({}, {}, { sort: { "_id": -1 } });

      // console.log(image)

      return res.status(200).json({
        success: true,
        image,

      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Fetches a particular file by filename
  // router.get('/file/:filename', async (req, res) => {
  //   try {
  //     await gfs.find({ filename: req.params.filename }).toArray((err, files) => {
  //       if (!files[0] || files.length === 0) {
  //         return res.status(200).json({
  //           success: false,
  //           message: 'No files available',
  //         })
  //       }

  //       return res.status(200).json({
  //         success: true,
  //         file: files[0],
  //       });
  //     });


  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }

  // });


  // Fetches a particular image and render on browser
  router.get('/image/:filename', async (req, res) => {
    // console.log(req.params.filename);
    try {

      await mongoClient.connect();
      const database = mongoClient.db("React_Mongo_upload")

      const imageBucket = new GridFSBucket(database, {
        bucketName: "uploads",
      });


      let downloadStream = imageBucket.openDownloadStreamByName(
        req.params.filename
      );

      downloadStream.on("data", function (data) {
        return res.status(200).write(data)
      })

      downloadStream.on("error", function (data) {
        return res.status(404).send({ error: "Image not found" })
      })

      downloadStream.on("end", () => {
        return res.end()
      })


    } catch (error) {
      return res.status(500).json({
        success: false,
        error
      });
    }

  });





  return router;
};