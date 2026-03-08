"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticHumanHandoffGuard = void 0;
// Placeholder guard. Replace with DB/CRM source of truth for operator-active conversations.
class StaticHumanHandoffGuard {
    activeConversations = new Set();
    constructor(initialConversations = []) {
        initialConversations.forEach((conversationId) => this.activeConversations.add(conversationId));
    }
    async isHumanHandoffActive(conversationId) {
        return this.activeConversations.has(conversationId);
    }
    setActive(conversationId) {
        this.activeConversations.add(conversationId);
    }
    clearActive(conversationId) {
        this.activeConversations.delete(conversationId);
    }
}
exports.StaticHumanHandoffGuard = StaticHumanHandoffGuard;
//# sourceMappingURL=humanHandoffGuard.js.map