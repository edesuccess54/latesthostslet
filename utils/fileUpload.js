const multer = require('multer')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('okay ooo')
        cb(null, 'uploads/')
    },

    filename: function (req, file, cb) { 
        cb(null, new Date().toString().replace(/:/g,"-" )+ "-" + file.originalname)
    }
})

function fileFilter(req, file, cb) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({ storage, fileFilter })

module.exports = upload;
