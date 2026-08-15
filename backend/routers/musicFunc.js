const express = require("express");
const router = express.Router();

const musicController = require('../controller/musicController');

router.get('/UploadSong', musicController.UploadSong);

module.exports = router;