const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv");
const multer = require('multer');
const uploadImageRouter = require("./routes/image");
const path = require('path');
const methodOverride = require('method-override');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());
app.use(methodOverride('_method'));
dotenv.config();
app.use(express.static(path.join(__dirname, 'public')));


mongoose
  .connect(process.env.mongoURI)
  .then(console.log("Connected to MongoDB"))
  .catch((err) => {
    console.log(err);
  });

// create storage engine
const storage = new GridFsStorage({
  url: process.env.mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });




app.use('/api/upload', uploadImageRouter(upload))


app.listen(5555, () => {
  console.log("server listening on");
})

