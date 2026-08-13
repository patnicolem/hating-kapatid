export type FriendUser = {
  id: string;
  name: string;
  email: string;
};

export type IncomingFriendRequest = {
  requestId: string;
  from: FriendUser;
  createdAt: string;
};

export type OutgoingFriendRequest = {
  requestId: string;
  to: FriendUser;
  createdAt: string;
};

export type FriendsSummary = {
  friends: FriendUser[];
  incoming: IncomingFriendRequest[];
  outgoing: OutgoingFriendRequest[];
};