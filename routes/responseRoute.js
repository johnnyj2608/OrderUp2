const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

router.get('/response', async (req, res) => {
    res.render('response');
});

module.exports = router;