# Expenses bot test

Accounting bot for register expenses records, actual use in [**commit_36 coop**](https://commite.ar/) .

## Pre Installation

Require a google-api-credentials for google sheet api (service account):

https://developers.google.com/workspace/guides/create-credentials

Require to create a bot and its corresponding token:

https://core.telegram.org/bots/api


## Installation

npm install


## Lear more about the Stack

The project use these libs:
    dotenv
    express
    googleapis
    lodash
    moment
    telegraf
    nodemon
    ngrok for local development secure tunnel https://github.com/bubenshchykov/ngrok

## Test and Deploy

Actual project deployed in render

Production:

npm run start

Development:

npm run dev

## Usage

https://core.telegram.org/bots/api#authorizing-your-bot

Set Tokens:
    export BOT_TOKEN= token  >> more permanent way of set BOT_TOKEN
    BOT_TOKEN = token node index.js

Registro gasto:
/gasto personal/cuenta monto notas (la fecha toma de referencia el dia del mensaje).

Personal/Cuentas disponibles:
/cuentas

## Authors and acknowledgment

Thank's mariano walter and toni
