const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const {registerUser, loginUser, logoutUser, updateUser, deactivateUser, getUserProfile, getAllUsers, changeUserRole, deactivateUserById, reactivateUserById, deleteToken} = require('../controllers/user')
const {isAuthenticatedUser, isAdmin} = require('../middlewares/auth')
router.post('/register', upload.single('image'), registerUser)
router.post('/login', loginUser)
router.post('/logout', isAuthenticatedUser, logoutUser)
router.post('/update-profile', isAuthenticatedUser, upload.single('image'), updateUser)
router.delete('/deactivate', isAuthenticatedUser, deactivateUser)

router.get('/profile', isAuthenticatedUser, getUserProfile)
router.get('/users', isAuthenticatedUser, isAdmin, getAllUsers)
router.patch('/users/:id/role', isAuthenticatedUser, isAdmin, changeUserRole)
router.patch('/users/:id/deactivate', isAuthenticatedUser, isAdmin, deactivateUserById)
router.patch('/users/:id/reactivate', isAuthenticatedUser, isAdmin, reactivateUserById)
router.post('/delete-token', isAuthenticatedUser, deleteToken);

module.exports = router;