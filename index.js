const { Telegraf } = require('telegraf');
var moment = require('moment');
const { google } = require('googleapis');
var _ = require('lodash');
require('dotenv').config();
const fs = require('fs');
const app = require('./app');
const bot = new Telegraf(process.env.BOT_ENV === "dev" ? process.env.BOT_TOKEN_TEST : process.env.BOT_TOKEN)
const ngrok = require('ngrok');
let url = null;

// Read the contents of the JSON file
fs.readFile('google-api-credentials.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);
});

const auth = new google.auth.GoogleAuth({
    keyFile: 'google-api-credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

async function write(data) {
    try {
        //Create client instance
        const client = await auth.getClient();
        //Instance of google sheets api
        const googleSheets = google.sheets({ version: 'v4', auth: client });
        googleSheets.spreadsheets.values.append({
            spreadsheetId: '1Ku5VfmmmsTGDzEUoPqUQ-Hdh0bD-mmSfF4u6O6sFj8I',
            range: 'Gastos-Commit!A:J',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: data,
            auth,
        });
    } catch (error) {
        console.log(error);
    }
}

bot.command('gasto', (ctx) => {
    const regtime = moment().format('DD-MM-YYYY');
    const str = ctx.message.text;
    const spentReg = str.match(/(?:^\/\w+)(\s+)(?<worker>\w+)(\s+)(?<money>-?\d+)(\s+)+(?<notes>.+)/mu).groups;
    const data = { values: [[regtime, '', spentReg.money, spentReg.worker, spentReg.notes, 'bot']] }
    console.log("registro", spentReg, spentReg[1], spentReg.money);
    console.log(data);
    write(data);
    ctx.reply(`persona: ${spentReg.worker}\n monto: ${spentReg.money}\n notas: ${spentReg.notes}\n fecha: ${regtime}`);
});

async function read(range, majorDimension) {
    //Create client instance
    const client = await auth.getClient();
    //Instance of google sheets api
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    const met = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: '1Ku5VfmmmsTGDzEUoPqUQ-Hdh0bD-mmSfF4u6O6sFj8I',
        range: `${range}`,
        majorDimension: majorDimension ? majorDimension : null,
    });
    return met.data.values;
}

async function readBalance() {
    // funciona como un buscar V
    let accounts = await read('Gastos-Commit!L4:L20', 'COLUMNS');
    let listAccounts = accounts[0];
    console.log(listAccounts);
    return listAccounts
}

bot.command('cuentas',(ctx) => {
    readBalance().then(accounts => {
        let text = accounts.join(", ");
        ctx.reply(text);
    });
})


// Test telegram service with out test google services 
bot.command('help', (ctx) => {
    console.log("help command");
    ctx.reply('Hola! soy el bot de gestion contable de commit_36 \n\n Consultas que puedes realizar: \n\n 1) Consultar cuentas/personal disponible \n\t/cuentas \n 2)Registrar gasto \n\t /gasto trabajador monto tipo de gasto')
});

const port = process.env.PORT || 4000;

app.use(bot.webhookCallback('/telegraf'));

process.env.BOT_ENV === "dev" ? (async function () {
    url = await ngrok.connect(port);
    bot.telegram.setWebhook(`${url}/telegraf`);
    console.log(url);
    console.log(process.env.BOT_TOKEN_TEST);
})() :
    bot.telegram.setWebhook('https://telegram-bot-g1vd.onrender.com/telegraf');


app.listen(port, () => console.log("Webhook bot listening on port", port));


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

