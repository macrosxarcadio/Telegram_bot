const { Telegraf } = require('telegraf');
var moment = require('moment');
const { google } = require('googleapis');
var _ = require('lodash');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const auth = new google.auth.GoogleAuth({
    keyFile: 'google-api-credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
})

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
    let balanceRow = await read('hoja_2!A:A', 'COLUMNS');
    let row = await balanceRow[0].indexOf('Saldo', 0);
    let balance = await read(`hoja_2!D${row + 1}`, 'COLUMNS');
    return balance;
}

async function write(data) {
    //Create client instance
    try {
        const client = auth.getClient();
        //Instance of google sheets api
        const googleSheets = google.sheets({ version: 'v4', auth: await client });
        const writing = googleSheets.spreadsheets.values.append({
            spreadsheetId: '1Ku5VfmmmsTGDzEUoPqUQ-Hdh0bD-mmSfF4u6O6sFj8I',
            range: 'Gastos-Commit!A:L',
            valueInputOption: 'RAW',
            resource: data,
            auth,
        });
        return writing;
    } catch (error) {
        console.log(error);
    }
}

bot.command('fondo', (ctx) => {
    readBalance().then((response) => {
        ctx.reply(response.flat()[0]);
    }
    )
}
)
bot.command('r', (ctx) => {
    read().then((response) => {
        ctx.reply(response.values);
        response.values.map(r => ctx.reply(r));
    }
    )
})

bot.command('test', (ctx) => {
    ctx.reply('el bot funciona');
})

bot.command('gasto', (ctx) => {
    const regtime = moment().format('DD-MM-YYYY');
    const str = ctx.message.text;
    const spentReg = str.match(/(?:^\/\w+)(\s+)(?<worker>\w+)(\s+)(?<money>-?\d+)(\s+)+(?<notes>.+)/mu).groups;
    const data = { values: [[, , regtime, , spentReg.money, spentReg.worker, spentReg.notes, 'bot']] }
    console.log("registro", spentReg, spentReg[1], spentReg.money);
    write(data);
    ctx.reply(` persona: ${spentReg.worker} \n monto: ${spentReg.money} \n notas: ${spentReg.notes} \n fecha: ${regtime}`);
});

// Test telegram service with out test google services 
bot.command('help', (ctx) => {
    ctx.reply('Hola! soy el bot de gestion contable de commit_36 \n\n Consultas que puedes realizar: \n\n 1) Consultar sueldo antes de aportes \n\t/sueldo mes trabajador \n 2)Registrar gasto \n\t /gasto trabajador monto tipo de gasto');
})

const port = process.env.PORT || 3000;

console.log(port);

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

