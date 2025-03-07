const express = require('express');
const { adminDashboard, createProductPage, createProperty, walletPage, updatePaymentDetail, editProopertyPage, editProopertyDetail, propertyReviewPage, addPropertyReview, deleteProperty, reservationCodePage, generateWithdrawalCode, pagmentPage, approvePayment, rejectPayment, withdrawalPage, approveWithdrawal, rejectWithdrawal, checkinsPage, checkins, usersPage, viewUserDocument, approveDocument, rejectDocument, changePassword, changePasswordPage, userDetailPage, updateUserAccountStatus, blockUserAccount, activateUserWithdrawal, fundDepositPage, fundProfitPage, fundBonusPage, fundDeposit, fundProfit, fundBonus, deleteUser, deleteUserCheckins, editCheckinsPage, editUserCheckin, updateUserProperty, viewReviewPage, topUpShares, topUpUserSharesPage} = require('../controllers/adminControllers');
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
router.get('/users', auth, authorize('admin'), usersPage);
router.get('/change-password', auth, authorize('admin'), changePasswordPage);
router.get('/user-detail', auth, authorize('admin'), userDetailPage);
router.get('/fund-deposit', auth, authorize('admin'), fundDepositPage);
router.get('/fund-profit', auth, authorize('admin'), fundProfitPage);
router.get('/fund-bonus', auth, authorize('admin'), fundBonusPage);
router.get('/view-reviews', auth, authorize('admin'), viewReviewPage);

router.get('/fund-shares', auth, authorize('admin'), topUpUserSharesPage);


router.post('/create', auth, authorize('admin'),  upload.array("images"), createProperty);
router.post('/wallet', auth, authorize('admin'), upload.single("file"), updatePaymentDetail);
router.put('/edit/:propertyId', auth, authorize('admin'), upload.single("images"), editProopertyDetail);
router.delete('/delete/:propertyId', auth, authorize('admin'), deleteProperty);
router.post('/review/:propertyId', auth, authorize('admin'), upload.single('file'), addPropertyReview);
router.post('/code/:id', auth, authorize('admin'), generateWithdrawalCode);
router.post('/approve-payment/:id', auth, authorize('admin'), approvePayment);
router.post('/reject-payment/:id', auth, authorize('admin'), rejectPayment);

router.post('/change-password', auth, authorize('admin'), changePassword);

router.post('/approve-document/:id', auth, authorize('admin'), approveDocument);
router.post('/reject-document/:id', auth, authorize('admin'), rejectDocument);

router.post('/block/:id', auth, authorize('admin'), blockUserAccount);
router.post('/activate-withdrawal/:id', auth, authorize('admin'), activateUserWithdrawal);

router.delete('/delete-checkins/:id', auth, authorize('admin'), deleteUserCheckins)
router.get('/edit-checkins', auth, authorize('admin'), editCheckinsPage)

router.put('/edit-checkin/:id', auth, authorize('admin'), editUserCheckin)


router.post('/approve-withdraw/:id', auth, authorize('admin'), approveWithdrawal);
router.post('/reject-withdraw/:id', auth, authorize('admin'), rejectWithdrawal);
router.post('/checkins/:id', auth, authorize('admin'), checkins);
router.post('/doc/:id', auth, authorize('admin'), viewUserDocument);

router.post('/user-account-status/:id', auth, authorize('admin'), updateUserAccountStatus);

router.post('/fund-deposit/:id', auth, authorize('admin'), fundDeposit);
router.post('/fund-profit/:id', auth, authorize('admin'), fundProfit);
router.post('/fund-bonus/:id', auth, authorize('admin'), fundBonus);
router.post('/top-up-shares/:id', auth, authorize('admin'), topUpShares);

router.delete('/delete-user/:id', auth, authorize('admin'), deleteUser);
router.post('/property/:id', auth, authorize('admin'), updateUserProperty);






module.exports = router