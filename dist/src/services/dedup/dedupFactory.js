"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdempotencyStore = void 0;
const inMemoryIdempotencyStore_1 = require("./inMemoryIdempotencyStore");
const createIdempotencyStore = () => {
    return new inMemoryIdempotencyStore_1.InMemoryIdempotencyStore();
};
exports.createIdempotencyStore = createIdempotencyStore;
//# sourceMappingURL=dedupFactory.js.map