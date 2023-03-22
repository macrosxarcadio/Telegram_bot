const { Telegraf } = require('telegraf');
var moment = require('moment');
const { google } = require('googleapis');
var _ = require('lodash');
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
})

async function read(range, majorDimension) {
    //Create client instance
    const client = await auth.getClient();
    //Instance of google sheets api
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    const met = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: '1z48rYKJREW8FKVdCwOBfwsujwbWKXq73fHIoqOBOcu4',
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
    const client = await auth.getClient();
    //Instance of google sheets api
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    try {
        const writing = await googleSheets.spreadsheets.values.append({
            spreadsheetId: '1z48rYKJREW8FKVdCwOBfwsujwbWKXq73fHIoqOBOcu4',
            range: 'hoja_1!A:E',
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
        //map(rel => ctx.reply(rel));
    }
    )
})

bot.command('w', (ctx) => {
    const regtime = moment().format('L');
    const str = ctx.message.text;
    const monto = str.match(/(\d[0-9])/gu).join('');
    const txt = str.split(':');
    const notes = txt.pop();
    const personal = txt.shift().match(/(\w[a-z])/gu).join('');
    const data = { values: [[regtime, personal, monto, 'cajita', notes]] }
    write(data);
    ctx.reply(`persona: ${personal}, monto: ${monto}, notas:${notes}, fecha: ${regtime}`);
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

