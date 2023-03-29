# expenses bot test

Accounting bot for register expenses records, actual use in commit_36 coop.

## Stack

The project use these libs:
    "dotenv"
    "express"
    "googleapis"
    "lodash"
    "moment"
    "telegraf"
    "nodemon"
    "ngrok" for local development secure tunnel https://github.com/bubenshchykov/ngrok

## Test and Deploy

Actual project deployed in render

Production:

npm run start

Development:

npm run dev

## Installation

npm install

## Usage
https://core.telegram.org/bots/api#authorizing-your-bot

Set Tokens:
    export BOT_TOKEN= token  >> more permanent way of set BOT_TOKEN
    BOT_TOKEN = token node index.js

Registro gasto:
/gasto personal/cuenta monto notas (la fecha toma de referencia el dia del mensaje).

Personal/Cuentas disponibles:
fondo: Fondo disponible en la cooperativa.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## Project status
