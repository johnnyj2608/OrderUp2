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
        memberTitle,
        memberRow,
    } = req.body;

    const breakfastCol = Number(breakfastID)
    const lunchCol = Number(lunchID)+4
    const memberName = memberTitle.split('\n')[1].trim();

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

        const estDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
        const today = new Date(estDate).getDay();
        let difference = Number(weekday) - today;
        if (difference < 0) {
            difference += 6;    // Not 7 because of Sunday
        }
        const historyCol = 20 - (difference * 4);
        
        const historyRowPromise = getNextRow('History', historyCol);

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
            {
                updateCells: {
                    range: {
                        sheetId: historySheetId,
                        startRowIndex: historyRow - 1,
                        endRowIndex: historyRow,
                        startColumnIndex: historyCol,
                        endColumnIndex: historyCol + 3
                    },
                    rows: [
                        {
                            values: [
                                { userEnteredValue: { stringValue: memberName } },
                                { userEnteredValue: { stringValue: breakfastName === 'none' ? '' : breakfastName } },
                                { userEnteredValue: { stringValue: lunchName === 'none' ? '' : lunchName } },
                            ]
                        }
                    ],
                    fields: 'userEnteredValue'
                }
            },
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
                {
                    updateCells: {
                        range: {
                            sheetId: weekdaySheetId,
                            startRowIndex: memberRow,
                            endRowIndex: memberRow+1,
                            startColumnIndex: 11,
                            endColumnIndex: 12
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { boolValue: true } }
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
                {
                    updateCells: {
                        range: {
                            sheetId: weekdaySheetId,
                            startRowIndex: memberRow,
                            endRowIndex: memberRow+1,
                            startColumnIndex: 12,
                            endColumnIndex: 13
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { boolValue: true } }
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