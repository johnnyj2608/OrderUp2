const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

router.get("/", async (req, res) => {
    const googleSheets = getGoogleSheets();
    const spreadsheet = await googleSheets.spreadsheets.get({ spreadsheetId });
    const excludedSheets = ["breakfast", "lunch", "menu", "qr", "history", "preorders"];
    sheetNames = spreadsheet.data.sheets
        .map(sheet => sheet.properties.title)
        .filter(title => !excludedSheets.includes(title.toLowerCase()));
    if (sheetNames.length === 0) {
        return res.status(404).json({ error: "No valid sheet names found." });
    }
    res.render("main", { sheetNames });
});

module.exports = router;
