export type ServerStatus = {
  online: boolean;
  playerCount: number;
  maxPlayers: number;
  queueLength: number;
  tps: number;
  version: string;
  motd: string;
  lastRestart: string;
  nextEvent: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
  category: "Update" | "Event" | "Alert" | "News";
};

export type PlayerStat = {
  name: string;
  rank: "Owner" | "Admin" | "Moderator" | "Helper" | "Champion" | "Member";
  playtimeHours: number;
  balance: number;
  questsCompleted: number;
  lastSeen: string;
  isOnline: boolean;
};

export type Event = {
  id: string;
  title: string;
  category: "Tournament" | "Seasonal" | "Community" | "Economy";
  description: string;
  start: string;
  location: string;
  host: string;
  rewards: string[];
};

export type ResourcePack = {
  id: string;
  name: string;
  type: "Mod Pack" | "Data Pack" | "Texture Pack" | "Guide";
  description: string;
  version: string;
  downloadUrl: string;
  sizeMB: number;
};

export type Warp = {
  id: string;
  name: string;
  description: string;
  coordinates: string;
  tags: string[];
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  timezone: string;
  availability: string;
  bio: string;
};

export type SupportArticle = {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
};

export type VoteSite = {
  id: string;
  name: string;
  url: string;
  reward: string;
};

export type MarketplaceListing = {
  id: string;
  title: string;
  seller: string;
  price: number;
  description: string;
  tags: string[];
};

export type TrainingGuide = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
};

export type ApiOverviewResponse = {
  status: ServerStatus;
  announcements: Announcement[];
  events: Event[];
  topPlayers: PlayerStat[];
  resources: ResourcePack[];
  warps: Warp[];
  staff: StaffMember[];
  supportArticles: SupportArticle[];
  voteSites: VoteSite[];
  marketplace: MarketplaceListing[];
  guides: TrainingGuide[];
};

export type TicketRequest = {
  player: string;
  topic: string;
  message: string;
  contact: string;
};

export type TicketResponse = {
  success: boolean;
  reference: string;
  message: string;
};

export type FeedbackRequest = {
  player: string;
  rating: number;
  message: string;
};

export type FeedbackResponse = {
  success: boolean;
  message: string;
};
