const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

router.get('/history', async (req, res) => {
    try {
        const googleSheets = getGoogleSheets();
        const spreadsheet = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `History!A1:DW`,
            valueRenderOption: 'FORMULA'
        });
        const data = spreadsheet.data.values;

        res.render('history');
    } catch (error) {
        console.error("Error loading sheet data: ", error);
        res.status(500).send("Error loading sheet data");
    }
});

module.exports = router;