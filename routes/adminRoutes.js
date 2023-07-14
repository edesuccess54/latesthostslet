const express = require('express');
const { adminDashboard, createProductPage, createProperty, walletPage, updatePaymentDetail, editProopertyPage, editProopertyDetail, propertyReviewPage, addPropertyReview, deleteProperty, reservationCodePage, generateReservationCode, pagmentPage, approvePayment, rejectPayment, withdrawalPage, approveWithdrawal, rejectWithdrawal, checkinsPage, checkins } = require('../controllers/adminControllers');
const upload = require('../utils/fileUpload.js');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();


router.get('/dashboard', auth, authorize('admin'), adminDashboard);
router.get('/create', auth, authorize('admin'), createProductPage);
router.get('/wallet', auth, authorize('admin'), walletPage);
router.get('/edit', auth, authorize('admin'), editProopertyPage);
router.get('/review', auth, authorize('admin'), propertyReviewPage);
router.get('/code', auth, authorize('admin'), reservationCodePage);
router.get('/payment', auth, authorize('admin'), pagmentPage);
router.get('/withdraw', auth, authorize('admin'), withdrawalPage);
router.get('/checkins', auth, authorize('admin'), checkinsPage);


router.post('/create', auth, authorize('admin'), upload.array("images"), createProperty);
router.post('/wallet', auth, authorize('admin'), upload.single("file"), updatePaymentDetail);
router.put('/edit/:propertyId', auth, authorize('admin'), upload.single("images"), editProopertyDetail);
router.delete('/delete/:propertyId', auth, authorize('admin'), deleteProperty);
router.post('/review/:propertyId', auth, authorize('admin'), upload.single('file'), addPropertyReview);
router.post('/code', auth, authorize('admin'), generateReservationCode);
router.post('/approve-payment/:id', auth, authorize('admin'), approvePayment);
router.post('/reject-payment/:id', auth, authorize('admin'), rejectPayment);

router.post('/approve-withdraw/:id', auth, authorize('admin'), approveWithdrawal);
router.post('/reject-withdraw/:id', auth, authorize('admin'), rejectWithdrawal);
router.post('/checkins', auth, authorize('admin'), checkins);






module.exports = router