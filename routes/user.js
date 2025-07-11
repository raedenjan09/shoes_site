const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const {registerUser, loginUser, updateUser, deactivateUser, getUserProfile} = require('../controllers/user')
const {isAuthenticatedUser} = require('../middlewares/auth')
router.post('/register', upload.single('image'), registerUser)
router.post('/login', loginUser)
router.post('/update-profile', isAuthenticatedUser, upload.single('image'), updateUser)
router.delete('/deactivate', isAuthenticatedUser, deactivateUser)

router.get('/profile', isAuthenticatedUser, getUserProfile)

module.exports = router;