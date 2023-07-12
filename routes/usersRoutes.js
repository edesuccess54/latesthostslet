const express = require('express');
const { userRegisteration, loginUser, logoutUser, userDashboardPage, personalInfoPage, accountPage, helpPage, howItWorksPage, tripspage, paymentPage, updateName, updateEmail, updateNumber, updatePassword, profilePage, withdrawalPage, transactionPage, checkinsPage, payment, withdraw, changedp} = require('../controllers/usersControllers');

const upload = require('../utils/fileUpload.js');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();


router.get('/dashboard', auth, authorize('user'), userDashboardPage)
router.get('/personal-info', auth, authorize('user'), personalInfoPage)
router.get('/account', auth, authorize('user'), accountPage);
router.get('/help-center', auth, authorize('user'), helpPage)
router.get('/how-it-works', auth, authorize('user'), howItWorksPage)
router.get('/trips', auth, authorize('user'), tripspage)
router.get('/payment', auth, authorize('user'), paymentPage)
router.get('/widthdraw', auth, authorize('user'), withdrawalPage)
router.get('/profile', auth, authorize('user'), profilePage)
router.get('/transaction', auth, authorize('user'), transactionPage)
router.get('/checkins', auth, authorize('user'), checkinsPage);



router.post('/personal-info', auth, authorize('user'), updateName);
router.post('/update-email', auth, authorize('user'), updateEmail);
router.post('/update-number', auth, authorize('user'), updateNumber);
router.put('/update-password', auth, authorize('user'), updatePassword);
router.post('/payment', auth, authorize('user'), upload.single('file'), payment);
router.post('/withdraw', auth, authorize('user'), withdraw);
router.post('/changedp', auth, authorize('user'), upload.single('file'), changedp)

router.post('/signup', userRegisteration);
router.post('/login', loginUser);
router.get('/logout', logoutUser);






module.exports = router