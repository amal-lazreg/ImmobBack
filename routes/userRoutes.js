
// routes/user.routes.js
const express = require('express');
const router = express.Router();
const { signupController, signinController,updateAdminProfile, getUserByIdController,getIdByUsername } = require('../controllers/userController');

router.post('/signup', signupController);
router.post('/signin', signinController);
router.put('/admin/updateProfile/:_id', updateAdminProfile);
router.get('/getUser/:_id',getUserByIdController) ; 

router.get('/getIdByUsername', getIdByUsername)



module.exports = router;