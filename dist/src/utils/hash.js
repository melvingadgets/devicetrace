"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stableHash = void 0;
const crypto_1 = require("crypto");
const stableHash = (value) => (0, crypto_1.createHash)('sha256').update(value).digest('hex');
exports.stableHash = stableHash;
//# sourceMappingURL=hash.js.map