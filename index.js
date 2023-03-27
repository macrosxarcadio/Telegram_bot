const express = require('express');
const { Telegraf } = require('telegraf');
var moment = require('moment');
const { google } = require('googleapis');
var _ = require('lodash');
require('dotenv').config();
const fs = require('fs');
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Read the contents of the JSON file
fs.readFile('google-api-credentials.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
  
    // Parse the JSON data
    const jsonData = JSON.parse(data);
  
    // Log the JSON data to the console
    console.log(jsonData);
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
            range: 'Gastos-Commit!A:L',
            valueInputOption: 'RAW',
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
    const data = { values: [[, , regtime, , spentReg.money, spentReg.worker, spentReg.notes, 'bot']] }
    console.log("registro", spentReg, spentReg[1], spentReg.money);
    write(data);
    ctx.reply(` persona: ${spentReg.worker} \n monto: ${spentReg.money} \n notas: ${spentReg.notes} \n fecha: ${regtime}`);
}); 

// Test telegram service with out test google services 
bot.command('help', (ctx) => {
    ctx.reply('Hola! soy el bot de gestion contable de commit_36 \n\n Consultas que puedes realizar: \n\n 1) Consultar sueldo antes de aportes \n\t/sueldo mes trabajador \n 2)Registrar gasto \n\t /gasto trabajador monto tipo de gasto');
})

const port = process.env.PORT || 1000;

app.use(await bot.createWebhook({ domain: 'https://telegram-bot-g1vd.onrender.com' }));

app.listen(port, () => console.log("Listening on port", port));


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

