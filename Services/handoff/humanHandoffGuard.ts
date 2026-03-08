export interface HumanHandoffGuard {
  isHumanHandoffActive(conversationId: string, phoneNumberId?: string): Promise<boolean>;
}

// Placeholder guard. Replace with DB/CRM source of truth for operator-active conversations.
export class StaticHumanHandoffGuard implements HumanHandoffGuard {
  private readonly activeConversations = new Set<string>();

  constructor(initialConversations: string[] = []) {
    initialConversations.forEach((conversationId) => this.activeConversations.add(conversationId));
  }

  async isHumanHandoffActive(conversationId: string): Promise<boolean> {
    return this.activeConversations.has(conversationId);
  }

  setActive(conversationId: string): void {
    this.activeConversations.add(conversationId);
  }

  clearActive(conversationId: string): void {
    this.activeConversations.delete(conversationId);
  }
}
