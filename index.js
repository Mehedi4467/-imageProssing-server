const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const multer = require('multer');
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");


// use middleware
app.use(cors())
app.use(express.json());

const UPLOADS_FOLDER = "./products/";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER)
    },
    filename: (req, file, cb) => {
        const fileEXt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileEXt, '').toLocaleLowerCase().split(" ").join("-") + "-" + Date.now();
        cb(null, fileName + fileEXt);
    },
});
const upload = multer({

    storage: storage,
    limits: {
        fileSize: 10200000, // 500MB
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpeg"
        ) {
            cb(null, true)
        }
        else {
            cb(new Error("Only .jpg, .png, .jpeg format allowed!"))
        }
    },

});


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mehediImage:44676835@cluster0.9x7m2.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db("imageProcess").collection('img');


        app.post('/product', upload.fields([
            { name: 'primaryImage', maxCount: 1 },
            { name: 'secondImage', maxCount: 4 },

        ]), async (req, res) => {

            const img = req.files.primaryImage[0].path;
            const { filename: primaryImage } = req.files.primaryImage[0]
            // console.log(__dirname)

            await sharp(req.files.primaryImage[0].path)
                .resize(500, 500, {
                    // fit: sharp.fit.inside,
                    fit: sharp.fit.contain,
                    background: 'white'

                    // fit: sharp.fit.cover,
                    // position: sharp.strategy.entropy
                    // withoutEnlargement: true, // if image's original width or height is less than specified width and height, sharp will do nothing(i.e no enlargement)
                })

                .png({ quality: 100 })
                .toFile(
                    path.resolve(req.files.primaryImage[0].destination, 'resized', primaryImage)

                )

            fs.unlinkSync(req.files.primaryImage[0].path)
            console.log(`products/resized/${primaryImage}`)
            res.send({ SUCCESS: 'SUCCESS!' })


            // const secondImage = req.files.secondImage ? req.files.secondImage.map((secondPath, index) => req.files.secondImage[index].path) : []
            // const productName = req.body.productName;

            // const productInfo = {
            //     productName,
            // }

            // const result = await serviceCollection.insertOne(productInfo);
            // res.send(result);


        });



    }
    finally {
        // client.close();
    }
}

run().catch(console.dir);


// create Api

// app.get('/', (req, res) => {
//     res.send("hello I am Mehedi Hassan");

// });

app.listen(port, () => {
    console.log("server is running ...", port);
})