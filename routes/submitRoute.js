const express = require('express');
const router = express.Router();
const { spreadsheetId, getGoogleSheets, getSheetId, getNextRow } = require('../config/googleAPI');

const sheetsByWeekday = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
};

router.post("/submit", async (req, res) => {
    const { 
        weekday,
        breakfastID, 
        breakfastName, 
        lunchID, 
        lunchName,
        memberName,
    } = req.body;

    const breakfastCol = Number(breakfastID)
    const lunchCol = Number(lunchID)+4

    try {
        const sheetName = sheetsByWeekday[Number(weekday)]
        const weekdaySheetPromise = getSheetId(sheetName);
        const historySheetPromise = getSheetId('History');

        const menuRowPromises = [null, null];

        if (breakfastID !== "none" && breakfastName !== "none") {
            menuRowPromises[0] = getNextRow(sheetName, breakfastCol);
        }

        if (lunchID !== "none" && lunchName !== "none") {
            menuRowPromises[1] = getNextRow(sheetName, lunchCol);
        }
        
        const historyRowPromise = getNextRow('History', 0);

        const [
            weekdaySheetId,
            historySheetId,
            historyRow,
            breakfastRow,
            lunchRow,
        ] = await Promise.all([
            weekdaySheetPromise,
            historySheetPromise,
            historyRowPromise,
            ...menuRowPromises,
        ]);

        let requests = [

        ];
        
        if (breakfastRow !== null) {
            requests.push(
                {
                    updateCells: {
                        range: {
                            sheetId: weekdaySheetId,
                            startRowIndex: breakfastRow - 1,
                            endRowIndex: breakfastRow,
                            startColumnIndex: breakfastCol,
                            endColumnIndex: breakfastCol + 1
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { stringValue: memberName } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                },
            );
        }

        if (lunchRow !== null) {
            requests.push(
                {
                    updateCells: {
                        range: {
                            sheetId: weekdaySheetId,
                            startRowIndex: lunchRow - 1,
                            endRowIndex: lunchRow,
                            startColumnIndex: lunchCol,
                            endColumnIndex: lunchCol + 1
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { stringValue: memberName } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                },
            );
        }
        
        await getGoogleSheets().spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false });
    }
});

module.exports = router;