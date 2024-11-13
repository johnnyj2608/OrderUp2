const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

router.get('/history', async (req, res) => {
    try {
        const googleSheets = getGoogleSheets();
        const spreadsheet = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `History!A1:ES`,
            valueRenderOption: 'FORMULA'
        });
        const data = spreadsheet.data.values;

        const dateNumbers = data[0].filter(cell => cell !== "");
        const dates = dateNumbers.map(convertSerialToDate);

        result = {};
        for (let i = 2; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j += 5) {
                const date = dates[j / 5]
                if (!result[date]) {
                    result[date] = [];
                }

                if( data[i][j] === '') {
                    continue;
                }

                const row = i
                const name = data[i][j]
                const breakfast = data[i][j+1]
                const lunch = data[i][j+2]
                const timestamp = data[i][j+3]

                result[date].push({
                    row: row,
                    name: name,
                    breakfast: breakfast,
                    lunch: lunch,
                    timestamp: timestamp
                });
            }
        }

        res.render('history', {result});
    } catch (error) {
        console.error("Error loading sheet data: ", error);
        res.status(500).send("Error loading sheet data");
    }
});

function convertSerialToDate(serial) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const dayInMilliseconds = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + serial * dayInMilliseconds);

    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const year = date.getUTCFullYear().toString().slice(-2);

    return `${month}/${day}/${year}`;
}

module.exports = router;