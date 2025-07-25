const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')


const { getAllItems,
    getSingleItem,
    createItem,
    updateItem,
    deleteItem,
    searchItems,
    fullSearchItems
} = require('../controllers/item')

const {isAuthenticatedUser} = require('../middlewares/auth')

router.get('/items', getAllItems)
router.get('/items/search', searchItems);
router.get('/items/filter', fullSearchItems);
router.get('/items/:id', getSingleItem)
router.post('/items', isAuthenticatedUser, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), createItem)
router.put('/items/:id', isAuthenticatedUser, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), updateItem)
router.delete('/items/:id', isAuthenticatedUser, deleteItem)
module.exports = router;
