# CommunitySMP Hub

A multifunctional website for the CommunitySMP Minecraft server. The hub brings together live server information, rich player tools, downloadable resources, staff support, and community services in a single responsive interface designed specifically for our players.

## Features

- **Live status dashboard** – Track player counts, queue length, TPS, version details, next restarts, and marquee announcements in real time.
- **Events planner** – Browse upcoming CommunitySMP tournaments, markets, and community nights complete with categories, hosts, and rewards.
- **Player intelligence** – Search top players by rank or IGN, review stats at a glance, and deep-dive into curated training guides.
- **Resource library** – Download official mod/data packs and guides with quick filtering by category, version info, and file size.
- **Travel & economy tools** – Convert Overworld/Nether coordinates, explore public warp hotspots, and review featured marketplace listings.
- **Support & staff area** – Submit tickets, read knowledge base articles, check staff availability, and grab vote links for daily rewards.
- **Feedback loops** – Rate your experience and share suggestions – submissions generate reference IDs for easy follow-up.

## Development

```bash
npm install
npm run dev
```

The site is powered by a Cloudflare Worker API that serves live data to the React client. Use `npm run check` before deploying to ensure both the client and Worker type-check successfully.

## Deployment

Deploy to your Cloudflare account once you're ready:

```bash
npm run deploy
```

You can update the Worker data sources in `src/server/index.ts` to connect to real CommunitySMP infrastructure.
