let express = require('express'),    
    router = express.Router();

var walletController = require('../controllers/api/wallet')
var dropController = require('../controllers/api/drop')

router.post('/wallet/add', walletController.addWalletUser)
router.get('/wallet/:address', walletController.fetchWalletUser)
router.post('/wallet/update_name', walletController.updateWalletUserName)
router.post('/wallet/update_image', walletController.updateWalletUserImage)

//router.post('/drop/add',  upload.single('img_file'),  dropController.addDrop)
router.post('/drop/add',  dropController.addDrop)
router.get('/drop/all', dropController.getDropList)
router.get('/drop/featured', dropController.getFeaturedDrop)
router.post('/drop/update_bids', dropController.updateBids)
router.get('/drop/:dropId', dropController.fetchDrop)

//UPLOAD
let multer = require('multer');
const {v4 : uuidv4} = require('uuid')

const DIR = './public/';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, DIR);
  },
  filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-');
      cb(null, uuidv4() + '-' + fileName)
  }
});
var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
      } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
  }
});
router.post('/upload_image', upload.single('uploadImg'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const imgUrl = url + '/public/' + req.file.filename
  res.json({
    message: "upload successfully!",
    upload: imgUrl
    })
})

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message

        return errors
      }, {})
    })
  }

  return next(err)
})
  
module.exports = router