"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    FirstName: {
        type: String,
    },
    LastName: {
        type: String,
    },
    Email: {
        type: String,
    },
    Password: {
        type: String,
    },
    Profile: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "profile",
    },
    Verify: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["User", "StoreOwner", "Admin"],
        default: "User",
    },
});
exports.default = mongoose_1.default.model("user", UserSchema);
//# sourceMappingURL=UserModel.js.map