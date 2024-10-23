const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

router.get('/history', async (req, res) => {
    res.render('history');
});

module.exports = router;