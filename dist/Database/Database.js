"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Config_js_1 = require("../config/Config.js");
const LocalUrl = Config_js_1.config.Database_url;
const Db = mongoose_1.default.connect(LocalUrl);
Db.then(() => {
    console.log("Connection has been made to Database ");
}).catch((error) => {
    console.log(error, `The error message above is the reason why you can't connect to the Database at this time`);
});
exports.default = Db;
//# sourceMappingURL=Database.js.map