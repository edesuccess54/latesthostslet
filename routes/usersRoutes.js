const express = require('express');
const { userRegisteration, loginUser, logoutUser, userDashboardPage, personalInfoPage, accountPage, helpPage, howItWorksPage, tripspage, paymentPage, updateName, updateEmail, updateNumber, updatePassword, profilePage, withdrawalPage, transactionPage, checkinsPage, payment, withdraw, changedp, uploadUserIdentityDocument, emailVerificationPage, resendVerificationEmail, oldCheckinsPage, newCheckinsPage, verifyWithdrawal,changePropertyPage, updateUserProperty} = require('../controllers/usersControllers');

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
router.get('/change-user-property', auth, authorize('user'), changePropertyPage)
router.get('/transaction', auth, authorize('user'), transactionPage)

router.get('/old-checkins', auth, authorize('user'), oldCheckinsPage);
router.get('/new-checkins', auth, authorize('user'), newCheckinsPage);

router.get('/emailverification', emailVerificationPage) 

router.post('/personal-info', auth, authorize('user'), updateName);
router.post('/update-email', auth, authorize('user'), updateEmail);
router.post('/update-number', auth, authorize('user'), updateNumber);
router.put('/update-password', auth, authorize('user'), updatePassword);
router.post('/payment', auth, authorize('user'), upload.single('file'), payment);
router.post('/verify-withdraw', auth, authorize('user'), upload.single('file'), verifyWithdrawal);
router.post('/withdraw', auth, authorize('user'), upload.single('file'), withdraw);
router.post('/changedp', auth, authorize('user'), upload.single('file'), changedp)
router.post('/document', auth, authorize('user'), upload.single('file'), uploadUserIdentityDocument);

router.post('/property/:id', auth, authorize('user'), updateUserProperty)

router.post('/resend-email', auth, authorize('user'), resendVerificationEmail)

router.post('/signup', userRegisteration);
router.post('/login', loginUser);
router.get('/logout', auth, logoutUser);






module.exports = router