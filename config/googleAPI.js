const { google } = require('googleapis');
const { getAuthToken } = require('../services/getAuthToken');

const spreadsheetId = process.env.SPREADSHEET_ID;
let googleSheets;

async function initializeGoogleSheets() {
    try {
        const authToken = await getAuthToken();
        googleSheets = google.sheets({ version: 'v4', auth: authToken });
        console.log('Google Sheets initialization complete.');

    } catch (error) {
        console.error('Error during Google Sheets initialization:', error);
        process.exit(1);
    }
}

function getGoogleSheets() {
    if (!googleSheets) {
        throw new Error('Google Sheets client not initialized.');
    }
    return googleSheets;
}

async function getSheetId(sheetName) {
    try {
        const response = await googleSheets.spreadsheets.get({
            spreadsheetId
        });
        const sheets = response.data.sheets;
        const sheet = sheets.find(sheet => sheet.properties.title === sheetName);
        if (!sheet) {
            throw new Error(`Sheet with name "${sheetName}" not found.`);
        }
        return sheet.properties.sheetId;
    } catch (error) {
        console.error('Error fetching sheet ID:', error);
        throw error;
    }
}

async function getNextRow(sheetName, column) {
    try {
        const columnLetter = getColumnLetter(column)
        const range = `${sheetName}!${columnLetter}:${columnLetter}`;
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        const values = response.data.values || [];
        const nextRow = values.length + 1;
        return nextRow;
    } catch (error) {
        console.error('Error fetching next row:', error);
        throw error;
    }
}

function getColumnLetter(columnNumber) {
    let letter = '';
    while (columnNumber >= 0) {
        letter = String.fromCharCode((columnNumber % 26) + 65) + letter;
        columnNumber = Math.floor(columnNumber / 26) - 1;
    }
    return letter;
}

module.exports = {
    spreadsheetId,
    getGoogleSheets,
    getSheetId,
    getNextRow,
    initializeGoogleSheets,
};