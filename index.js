"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
const namesFilePath = "./names.json";
const duasFilePath = "./duas.json";
const loadData = (pathName) => {
    try {
        const data = fs_1.default.readFileSync(pathName, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        return [];
    }
};
const bot = new telegraf_1.Telegraf(process.env.BOT_API);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => {
    const reply = `
    /start - Start the bot
/help - Get help
/names - Get Allah names
/duas - Get all duas
    `;
    ctx.reply(reply);
});
bot.command("names", (ctx) => {
    const data = loadData(namesFilePath);
    const replyData = data
        .map((item) => `${item.name} - ${item.meaning}.`)
        .join("\n");
    ctx.reply(replyData);
});
bot.command("duas", (ctx) => {
    const data = loadData(duasFilePath);
    bot.telegram.sendMessage(ctx.chat.id, "More duas will be added soon", {
        reply_markup: {
            inline_keyboard: data.map((dua, index) => {
                return [telegraf_1.Markup.button.callback(dua.name, `dua_${index}`)];
            }),
        },
    });
});
bot.on("callback_query", (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    if (callbackData && callbackData.startsWith("dua_")) {
        const index = parseInt(callbackData.split("_")[1]);
        const data = loadData(duasFilePath);
        if (index >= 0 && index < data.length) {
            const dua = data[index];
            const message = `
        ${dua.name}:

${dua.dua}

${dua.english}

${dua.meaning}
      `;
            ctx.reply(message);
        }
    }
    ctx.answerCbQuery();
});
bot.on((0, filters_1.message)("text"), (ctx) => {
    const givenName = ctx.message.text.split("/")[1].toLocaleLowerCase();
    const data = loadData(namesFilePath);
    const replyData = data.filter((item) => item.name.toLocaleLowerCase() === givenName);
    if (replyData.length > 0) {
        ctx.reply(replyData[0].meaning);
    }
    else {
        ctx.reply("Sorry, No matching name found");
    }
});
bot.launch();
