const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const env = require('dotenv').config();
const errorHandler = require('./middleware/error.js')

const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/usersRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());


app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.use('/', mainRoutes);
app.use('/auth/users', userRoutes);
app.use('/auth/admin', adminRoutes);

app.use('*', (req, res) => {
    res.redirect('/')
})


app.use(errorHandler)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`connected to database and listening on port ${process.env.PORT}`);
    })
}).catch((err) => { 
    console.log(err.message);
})





