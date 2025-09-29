# CommunitySMP Hub

A multifunctional website for the CommunitySMP Minecraft server. The hub brings together live server information, rich player tools, downloadable resources, staff support, and community services in a single responsive interface designed specifically for our players.

## Features

- **Live status dashboard** – View online player counts, queue length, TPS, version details, and the latest announcements.
- **Events planner** – Discover upcoming CommunitySMP tournaments, build jams, and seasonal festivities with category filters and reward highlights.
- **Player insights** – Search top players by rank, activity, or balance and explore curated training guides to improve your gameplay.
- **Resource library** – Download mod packs, data packs, and guides maintained by the staff team with version tracking and quick filtering.
- **Travel & economy tools** – Convert Overworld and Nether coordinates, browse community marketplace listings, and plan trips to public warps.
- **Support centre** – Submit tickets, read knowledge base articles, review staff availability, and vote on partner sites to earn rewards.
- **Feedback loops** – Send suggestions directly from the site and keep track of reference IDs returned by the API endpoints.

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
