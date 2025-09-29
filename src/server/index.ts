import { routePartykitRequest, Server } from "partyserver";

import type {
  ApiOverviewResponse,
  FeedbackRequest,
  FeedbackResponse,
  OutgoingMessage,
  Position,
  TicketRequest,
  TicketResponse,
} from "../shared";
import type { Connection, ConnectionContext } from "partyserver";

type ConnectionState = {
  position: Position;
};

export class Globe extends Server {
  onConnect(conn: Connection<ConnectionState>, ctx: ConnectionContext) {
    const latitude = ctx.request.cf?.latitude as string | undefined;
    const longitude = ctx.request.cf?.longitude as string | undefined;

    if (!latitude || !longitude) {
      console.warn(`Missing position information for connection ${conn.id}`);
      return;
    }

    const position: Position = {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      id: conn.id,
    };

    conn.setState({
      position,
    });

    for (const connection of this.getConnections<ConnectionState>()) {
      try {
        conn.send(
          JSON.stringify({
            type: "add-marker",
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            position: connection.state!.position,
          } satisfies OutgoingMessage),
        );

        if (connection.id !== conn.id) {
          connection.send(
            JSON.stringify({
              type: "add-marker",
              position,
            } satisfies OutgoingMessage),
          );
        }
      } catch {
        this.onCloseOrError(conn);
      }
    }
  }

  onCloseOrError(connection: Connection) {
    this.broadcast(
      JSON.stringify({
        type: "remove-marker",
        id: connection.id,
      } satisfies OutgoingMessage),
      [connection.id],
    );
  }

  onClose(connection: Connection): void | Promise<void> {
    this.onCloseOrError(connection);
  }

  onError(connection: Connection): void | Promise<void> {
    this.onCloseOrError(connection);
  }
}

type Fetcher = {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
};

type Env = {
  Globe: DurableObjectNamespace;
  ASSETS: Fetcher;
};

const overviewData: ApiOverviewResponse = {
  status: {
    online: true,
    playerCount: 64,
    maxPlayers: 120,
    queueLength: 3,
    tps: 19.8,
    version: "1.21.4",
    motd: "CommunitySMP • Season 6 • End Rush Week!",
    lastRestart: "2025-01-03T18:45:00Z",
    nextEvent: "2025-01-11T16:00:00Z",
  },
  announcements: [
    {
      id: "season-6-hotfix",
      title: "Season 6 Balance Patch",
      body:
        "Villager trading costs have been adjusted and raid loot tables now include the new Relic Crate. Read the full changelog in Discord.",
      date: "2025-01-04T09:00:00Z",
      category: "Update",
    },
    {
      id: "winter-build-contest",
      title: "Snowspire Build Contest Finals",
      body:
        "Submit screenshots of your snow city by Friday to be entered into judging. Winners earn the exclusive Frostbound title.",
      date: "2025-01-02T19:30:00Z",
      category: "Event",
    },
    {
      id: "nether-alert",
      title: "Nether Highway Maintenance",
      body:
        "The westbound highway will be temporarily closed on Sunday for slab upgrades. Use warp /warp temp-west for detours.",
      date: "2025-01-01T21:15:00Z",
      category: "Alert",
    },
  ],
  events: [
    {
      id: "dragon-gauntlet",
      title: "Dragon Gauntlet League Week 3",
      category: "Tournament",
      description:
        "Teams of four speedrun the dragon fight with random handicaps. Earn league points toward the champion's Elytra skin.",
      start: "2025-01-11T16:00:00Z",
      location: "Arena Island",
      host: "Mod Kuno",
      rewards: ["1500 coins", "Champion Banner", "League Points"],
    },
    {
      id: "market-madness",
      title: "Market Madness Trading Fair",
      category: "Economy",
      description:
        "Sell and trade custom gear with player-run stalls. Economic advisors will share profit tips every hour.",
      start: "2025-01-12T18:00:00Z",
      location: "Spawn Marketplace",
      host: "Helper Tika",
      rewards: ["Boosted shop ads", "Limited vendor tag"],
    },
    {
      id: "ice-climb",
      title: "Ice Climb Parkour Rush",
      category: "Community",
      description:
        "Race up the frozen cliffs solo or co-op. The course randomizer adds new traps each run for replayability.",
      start: "2025-01-13T20:00:00Z",
      location: "Frostspire Mountains",
      host: "Admin Lira",
      rewards: ["Frostbite trail", "1,000 coins"],
    },
  ],
  topPlayers: [
    {
      name: "NovaScythe",
      rank: "Champion",
      playtimeHours: 428,
      balance: 18420,
      questsCompleted: 87,
      lastSeen: "2025-01-04T02:10:00Z",
      isOnline: true,
    },
    {
      name: "PixeLore",
      rank: "Member",
      playtimeHours: 312,
      balance: 9860,
      questsCompleted: 74,
      lastSeen: "2025-01-03T22:41:00Z",
      isOnline: false,
    },
    {
      name: "RuneTail",
      rank: "Member",
      playtimeHours: 289,
      balance: 14560,
      questsCompleted: 65,
      lastSeen: "2025-01-04T08:04:00Z",
      isOnline: true,
    },
    {
      name: "HarborFox",
      rank: "Moderator",
      playtimeHours: 533,
      balance: 24200,
      questsCompleted: 92,
      lastSeen: "2025-01-03T18:24:00Z",
      isOnline: true,
    },
    {
      name: "Quartzling",
      rank: "Member",
      playtimeHours: 198,
      balance: 6120,
      questsCompleted: 40,
      lastSeen: "2025-01-02T15:42:00Z",
      isOnline: false,
    },
    {
      name: "AetherPup",
      rank: "Helper",
      playtimeHours: 355,
      balance: 12550,
      questsCompleted: 58,
      lastSeen: "2025-01-04T01:05:00Z",
      isOnline: true,
    },
  ],
  resources: [
    {
      id: "community-pack",
      name: "Community Essentials Mod Pack",
      type: "Mod Pack",
      description:
        "Required QoL mods for CommunitySMP including minimap waypoints, voice chat, and server performance patches.",
      version: "3.2.1",
      downloadUrl: "https://communitysmp.gg/downloads/modpack.zip",
      sizeMB: 118,
    },
    {
      id: "builders-companion",
      name: "Builder's Companion Data Pack",
      type: "Data Pack",
      description:
        "Adds craftable scaffolding gadgets, blueprint previews, and asynchronous block logging for megabuild teams.",
      version: "2.5.0",
      downloadUrl: "https://communitysmp.gg/downloads/builders-companion.zip",
      sizeMB: 32,
    },
    {
      id: "frostbite",
      name: "Frostbite HD Textures",
      type: "Texture Pack",
      description:
        "Seasonal textures that match the winter event aesthetic while staying faithful to vanilla design.",
      version: "1.1.4",
      downloadUrl: "https://communitysmp.gg/downloads/frostbite-textures.zip",
      sizeMB: 84,
    },
    {
      id: "economy-handbook",
      name: "Economy Handbook",
      type: "Guide",
      description:
        "Explains shop tax brackets, auction etiquette, and daily quest routes curated by the economy committee.",
      version: "2025.1",
      downloadUrl: "https://communitysmp.gg/downloads/economy-handbook.pdf",
      sizeMB: 6,
    },
  ],
  warps: [
    {
      id: "spawn",
      name: "Central Spawn",
      description: "Main arrival hub with portal links, shopping district, and community bulletin board.",
      coordinates: "Overworld 0 / 70 / 0",
      tags: ["shops", "services", "events"],
    },
    {
      id: "iceport",
      name: "Iceport",
      description: "Gateway to the Frostspire range featuring penguin sanctuary and ice boat track.",
      coordinates: "Overworld -1820 / 63 / 4120",
      tags: ["winter", "parkour"],
    },
    {
      id: "nether-hub",
      name: "Nether Hub",
      description: "Highway intersection with labelled tunnels and fast lanes to player districts.",
      coordinates: "Nether 0 / 73 / 0",
      tags: ["transport", "portal"],
    },
    {
      id: "reef",
      name: "Coral Reef Sanctuary",
      description: "Community conservation project with custom reefs and donation board.",
      coordinates: "Overworld 1440 / 58 / -980",
      tags: ["eco", "build", "event"],
    },
  ],
  staff: [
    {
      id: "lira",
      name: "Lira",
      role: "Admin",
      timezone: "UTC+1",
      availability: "Daily 15:00 - 22:00",
      bio: "World edit specialist, event architect, and lore writer.",
    },
    {
      id: "kuno",
      name: "Kuno",
      role: "Moderator",
      timezone: "UTC-5",
      availability: "Wed-Sun 18:00 - 02:00",
      bio: "PvE balancing lead and head of the Dragon Gauntlet league.",
    },
    {
      id: "tika",
      name: "Tika",
      role: "Helper",
      timezone: "UTC+9",
      availability: "Weekends 09:00 - 13:00",
      bio: "Marketplace mentor who runs trade school workshops.",
    },
  ],
  supportArticles: [
    {
      id: "voice-chat",
      question: "How do I join the in-game voice chat?",
      answer:
        "Install the Community Essentials Mod Pack and enable Simple Voice Chat. Join the \"CommunitySMP\" channel in-game with /voice connect.",
      category: "Setup",
      tags: ["mods", "voice", "installation"],
    },
    {
      id: "lag-spikes",
      question: "What should I do during lag spikes?",
      answer:
        "Check the status widget for TPS. If it drops below 10, avoid redstone-heavy farms and report unusual behaviour via /ticket lag.",
      category: "Performance",
      tags: ["lag", "tps"],
    },
    {
      id: "shop-rules",
      question: "What are the marketplace guidelines?",
      answer:
        "Shop plots must be decorated, prices labelled, and inactive stores will be reclaimed after two weeks of inactivity.",
      category: "Economy",
      tags: ["shops", "economy"],
    },
  ],
  voteSites: [
    {
      id: "minecraft-mp",
      name: "Minecraft-MP",
      url: "https://minecraft-mp.com/server/communitysmp",
      reward: "+250 coins & Daily Vote Key",
    },
    {
      id: "topg",
      name: "TopG",
      url: "https://topg.org/server-communitysmp",
      reward: "Chance for Legendary Cosmetic",
    },
    {
      id: "planetminecraft",
      name: "PlanetMinecraft",
      url: "https://planetminecraft.com/server/communitysmp",
      reward: "Boosted XP for 1 hour",
    },
  ],
  marketplace: [
    {
      id: "elytra-service",
      title: "Custom Elytra Recolor Service",
      seller: "HarborFox",
      price: 1800,
      description: "Submit your hex palette and receive a lore-friendly Elytra within 24 hours.",
      tags: ["cosmetic", "service"],
    },
    {
      id: "netherite-bundle",
      title: "Raid Ready Netherite Bundle",
      seller: "NovaScythe",
      price: 3200,
      description: "Full set of enchanted netherite gear with totems, rockets, and potions.",
      tags: ["gear", "combat"],
    },
    {
      id: "beacon-lottery",
      title: "Beacon Lottery Tickets",
      seller: "RuneTail",
      price: 150,
      description: "Weekly draw for a max tier beacon. 20 tickets max per player.",
      tags: ["lottery", "beacon"],
    },
  ],
  guides: [
    {
      id: "start",
      title: "Starting Strong on CommunitySMP",
      summary: "Claim land, join a guild, and unlock essential utilities in your first evening.",
      steps: [
        "Complete the spawn tour quest line to unlock fast travel.",
        "Join a guild at /warp guildhall for shared storage and jobs.",
        "Set up a starter farm following the crop rotation tips in the handbook.",
      ],
    },
    {
      id: "profits",
      title: "Profiting from the Marketplace",
      summary: "Turn raw materials into premium stock and automate restocks with smart alerts.",
      steps: [
        "Survey current prices using the /market trends command before crafting.",
        "Bundle items into themed kits for higher margins.",
        "Schedule Discord webhook alerts whenever auctions for your tag go live.",
      ],
    },
    {
      id: "raids",
      title: "Mastering Raid Defense",
      summary: "Coordinate town defenses and unlock the Relic Crate bonus tier.",
      steps: [
        "Assign roles for tank, support, and artillery before triggering a raid.",
        "Stockpile splash regeneration and resistance in the guild vault.",
        "Use the bell + glow arrow combo to mark ravagers instantly.",
      ],
    },
  ],
};

const tickets: TicketRequest[] = [];
const feedbackEntries: FeedbackRequest[] = [];

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      ...(init.headers ?? {}),
    },
  });

const handleApiRequest = async (request: Request): Promise<Response | null> => {
  const url = new URL(request.url);

  if (!url.pathname.startsWith("/api/")) {
    return null;
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type",
      },
    });
  }

  if (request.method === "GET" && url.pathname === "/api/overview") {
    return json(overviewData);
  }

  if (request.method === "POST" && url.pathname === "/api/support") {
    try {
      const body = (await request.json()) as TicketRequest;
      const reference = `CSP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      tickets.push(body);
      const response: TicketResponse = {
        success: true,
        reference,
        message: "Ticket received! A staff member will respond in-game or via Discord within 24 hours.",
      };
      return json(response, { status: 201 });
    } catch (error) {
      return json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Invalid ticket payload.",
        },
        { status: 400 },
      );
    }
  }

  if (request.method === "POST" && url.pathname === "/api/feedback") {
    try {
      const body = (await request.json()) as FeedbackRequest;
      feedbackEntries.push(body);
      const response: FeedbackResponse = {
        success: true,
        message: "Thanks for improving CommunitySMP! Your feedback was logged.",
      };
      return json(response, { status: 201 });
    } catch (error) {
      return json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Invalid feedback payload.",
        },
        { status: 400 },
      );
    }
  }

  return json({ message: "Not Found" }, { status: 404 });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const apiResponse = await handleApiRequest(request);
    if (apiResponse) {
      return apiResponse;
    }

    const partyResponse = await routePartykitRequest(request, env);
    if (partyResponse) {
      return partyResponse;
    }

    if (request.method === "GET") {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }

      const url = new URL(request.url);
      if (!url.pathname.includes(".")) {
        const indexResponse = await env.ASSETS.fetch(new Request(url.origin + "/"));
        if (indexResponse.status !== 404) {
          return indexResponse;
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
