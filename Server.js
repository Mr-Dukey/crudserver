require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors')
const fs = require('fs');


const corsorg = {
    // origin:''
    origin:process.env.LOCAL_URL
}

app.use(cors(corsorg));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Multer upload configuration
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('Error connecting to MongoDB:', error));

// Define mongoose schema and model
const userSchema = new mongoose.Schema({
    title: String,
    sublines:String,
    BannerImage: String
});

const UserImg = mongoose.model('BannerUpdate', userSchema);

// POST route for uploading image
app.post('/uploadimg', upload.single('image'), (req, res) => {
    const title = req.body.title;
    const sublines = req.body.sublines;
    const image = req.file.filename;

    // console.log(title,sublines,image);
    UserImg.create({
        title: title,
        sublines:sublines,
        BannerImage: image
    })
    .then(user => {
        res.send(user);
    })
    .catch(error => {
        console.error('Error uploading image:', error);
        res.status(500).send('Error uploading image');
    });
});

// Serve uploaded images
app.use('/upload', express.static('uploads'));
app.get('/getfiles',function(req,res){
    UserImg.find()
    .then(function(user){
        res.send(user)
    })
    .catch(err => res.send(err))
})

//update
app.get('/getfiles/:id',function(req,res){
    UserImg.findById(req.params.id)
    .then(function(user){
        res.send(user)
    })
    .catch(err => res.send(err))
})

app.put('/update/:id',upload.single('image'), function(req,res){
    const title = req.body.title;
    const sublines = req.body.sublines;
    const image = req.file.filename;
    
    UserImg.findByIdAndUpdate(req.params.id,{
        title: title,
        subline:sublines,
        BannerImage: image
    })
    .then(function(user){
        res.send(user)
        fs.unlinkSync('./uploads/'+user.BannerImage)
    })
    .catch(err => res.send(err))
})
// delete

app.delete('/delete/:id',function(req,res){
    UserImg.findById(req.params.id)
    .then(function(data){
        fs.unlinkSync('./uploads/'+data.BannerImage)
    })
    UserImg.findByIdAndDelete(req.params.id)
    .then(res.send('Data deleted'))
});


// Start the server
const PORT = 1200;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
