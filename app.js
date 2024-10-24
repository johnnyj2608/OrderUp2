const express = require("express");
const favicon = require('serve-favicon');
const path = require("path");
const i18n = require("i18n");
const cookieParser = require("cookie-parser");
const basicAuth = require('express-basic-auth');
require('dotenv').config();

const { initializeGoogleSheets } = require('./config/googleAPI');

const mainRoute = require('./routes/mainRoute');
const responseRoute = require('./routes/responseRoute');
const historyRoute = require('./routes/historyRoute');
const submitRoute = require('./routes/submitRoute');
const switchRoute = require('./routes/switchRoute');

const app = express();

const customAuth = (username, password) => {
    return password === process.env.ADMIN_PASSWORD;
};

app.use(basicAuth({
    authorizer: customAuth,
    challenge: true,
    unauthorizedResponse: 'Unauthorized'
}));

i18n.configure({
    locales: ['en', 'zh'],
    directory: __dirname + '/locales',
    defaultLocale: 'zh',
    cookie: 'lang',
    objectNotation: true,
});

app.use(cookieParser());
app.use(i18n.init);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(favicon(path.join(__dirname,'assets','img','favicon.ico')));

app.use('/', mainRoute);
app.use('/', responseRoute);
app.use('/', historyRoute);
app.use('/', submitRoute);
app.use('/', switchRoute);

const startServer = async () => {
    try {
        await initializeGoogleSheets();
        const port = process.env.PORT || 1337;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to initialize Google Sheets client:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
