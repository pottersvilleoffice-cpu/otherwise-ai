export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface DirectParticipant {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
}

export interface DirectConversation {
  id: string;
  participants: string[];
  participantUsers: DirectParticipant[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount?: number;
  updatedAt: string;
}

export interface UserSearchItem {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
  joinedDate?: string;
}
