import "./styles.css";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import type {
  ApiOverviewResponse,
  MarketplaceListing,
  ResourcePack,
  TicketRequest,
  TicketResponse,
  FeedbackRequest,
  FeedbackResponse,
} from "../shared";

const formatDateTime = (date: string): string => {
  const instance = new Date(date);
  return instance.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

function App() {
  const [overview, setOverview] = useState<ApiOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerFilter, setPlayerFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState<"All" | ResourcePack["type"]>("All");
  const [warpQuery, setWarpQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [coordinateMode, setCoordinateMode] = useState<"OVERWORLD_TO_NETHER" | "NETHER_TO_OVERWORLD">(
    "OVERWORLD_TO_NETHER",
  );
  const [coordinateInput, setCoordinateInput] = useState("0, 0, 0");
  const [coordinateResult, setCoordinateResult] = useState<string>(
    "Enter coordinates to convert between dimensions.",
  );
  const [ticketState, setTicketState] = useState<{
    submitting: boolean;
    message: string;
    reference?: string;
  }>({ submitting: false, message: "" });
  const [feedbackState, setFeedbackState] = useState<{
    submitting: boolean;
    message: string;
  }>({ submitting: false, message: "" });
  const [feedbackRating, setFeedbackRating] = useState(4);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/overview");
        if (!response.ok) {
          throw new Error(`Failed to load overview data (status ${response.status})`);
        }
        const data = (await response.json()) as ApiOverviewResponse;
        setOverview(data);
        setSelectedGuide((current) => current ?? data.guides[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error while loading data");
      } finally {
        setLoading(false);
      }
    };

    load().catch((err) => {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error while loading data");
      setLoading(false);
    });
  }, []);

  const filteredPlayers = useMemo(() => {
    if (!overview) return [];
    const query = playerFilter.toLowerCase().trim();
    if (!query) return overview.topPlayers;
    return overview.topPlayers.filter((player) =>
      [player.name, player.rank].some((value) => value.toLowerCase().includes(query)),
    );
  }, [overview, playerFilter]);

  const filteredResources = useMemo(() => {
    if (!overview) return [];
    if (resourceFilter === "All") return overview.resources;
    return overview.resources.filter((resource) => resource.type === resourceFilter);
  }, [overview, resourceFilter]);

  const filteredWarps = useMemo(() => {
    if (!overview) return [];
    const query = warpQuery.toLowerCase().trim();
    if (!query) return overview.warps;
    return overview.warps.filter((warp) =>
      [warp.name, warp.description, warp.coordinates, ...warp.tags]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [overview, warpQuery]);

  const activeGuide = useMemo(() => {
    if (!overview) return null;
    return overview.guides.find((guide) => guide.id === selectedGuide) ?? overview.guides[0] ?? null;
  }, [overview, selectedGuide]);

  const handleCoordinateConvert = () => {
    const [x, y, z] = coordinateInput
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((value) => Number.parseFloat(value));

    if ([x, y, z].some((value) => Number.isNaN(value))) {
      setCoordinateResult("Please enter three numeric coordinates separated by commas or spaces.");
      return;
    }

    if (coordinateMode === "OVERWORLD_TO_NETHER") {
      setCoordinateResult(
        `Nether coordinates: ${formatNumber(x / 8)} / ${formatNumber(y)} / ${formatNumber(z / 8)}`,
      );
    } else {
      setCoordinateResult(
        `Overworld coordinates: ${formatNumber(x * 8)} / ${formatNumber(y)} / ${formatNumber(z * 8)}`,
      );
    }
  };

  const handleTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: TicketRequest = {
      player: (formData.get("player") as string)?.trim(),
      topic: (formData.get("topic") as string)?.trim(),
      message: (formData.get("message") as string)?.trim(),
      contact: (formData.get("contact") as string)?.trim(),
    };

    if (!payload.player || !payload.topic || !payload.message) {
      setTicketState({ submitting: false, message: "Please fill in your IGN, topic, and issue details." });
      return;
    }

    setTicketState({ submitting: true, message: "" });
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as TicketResponse;
      setTicketState({
        submitting: false,
        message: data.message,
        reference: data.reference,
      });
      if (response.ok) {
        form.reset();
      }
    } catch (err) {
      setTicketState({
        submitting: false,
        message: err instanceof Error ? err.message : "Failed to send ticket.",
      });
    }
  };

  const handleFeedbackSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: FeedbackRequest = {
      player: (formData.get("player") as string)?.trim() || "Anonymous",
      rating: feedbackRating,
      message: (formData.get("message") as string)?.trim(),
    };

    if (!payload.message) {
      setFeedbackState({ submitting: false, message: "Tell us what you think so we can act on it." });
      return;
    }

    setFeedbackState({ submitting: true, message: "" });
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as FeedbackResponse;
      setFeedbackState({ submitting: false, message: data.message });
      if (response.ok) {
        form.reset();
        setFeedbackRating(4);
      }
    } catch (err) {
      setFeedbackState({
        submitting: false,
        message: err instanceof Error ? err.message : "Feedback could not be delivered.",
      });
    }
  };

  const renderMarketplaceCard = (listing: MarketplaceListing) => (
    <article key={listing.id} className="card marketplace-card">
      <header className="card-header">
        <h4>{listing.title}</h4>
        <span className="pill">{listing.price.toLocaleString()} coins</span>
      </header>
      <p className="card-body">{listing.description}</p>
      <footer className="card-footer">
        <span>Seller: {listing.seller}</span>
        <div className="tag-row">
          {listing.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          <div>
            <p className="hero-tag">CommunitySMP Companion</p>
            <h1>All the tools you need to thrive on CommunitySMP</h1>
            <p className="hero-subtitle">
              Track events, download required packs, plan journeys, connect with staff, and stay informed about
              everything happening on the server.
            </p>
            <div className="hero-actions">
              <button onClick={() => scrollToSection("status")} className="button primary">
                View live status
              </button>
              <button onClick={() => scrollToSection("resources")} className="button ghost">
                Download resources
              </button>
            </div>
            <div className="ip-box">Server IP: play.communitysmp.gg</div>
          </div>
          <nav className="hero-nav">
            <h2>Quick Access</h2>
            <ul>
              <li>
                <button onClick={() => scrollToSection("events")}>Events</button>
              </li>
              <li>
                <button onClick={() => scrollToSection("players")}>Player stats</button>
              </li>
              <li>
                <button onClick={() => scrollToSection("travel-tools")}>Travel tools</button>
              </li>
              <li>
                <button onClick={() => scrollToSection("support")}>Support</button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section id="status" className="panel">
          <header className="panel-header">
            <h2>Live Server Overview</h2>
            <span className={overview?.status.online ? "status-online" : "status-offline"}>
              {overview?.status.online ? "Online" : "Offline"}
            </span>
          </header>
          {loading ? (
            <p>Loading live data…</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : overview ? (
            <div className="status-grid">
              <div className="status-card">
                <h3>Players</h3>
                <p>
                  {overview.status.playerCount}/{overview.status.maxPlayers}
                </p>
                <small>Queue: {overview.status.queueLength}</small>
              </div>
              <div className="status-card">
                <h3>T.P.S</h3>
                <p>{formatNumber(overview.status.tps)}</p>
                <small>Last restart {formatDateTime(overview.status.lastRestart)}</small>
              </div>
              <div className="status-card">
                <h3>Version</h3>
                <p>{overview.status.version}</p>
                <small>{overview.status.motd}</small>
              </div>
              <div className="status-card">
                <h3>Next Event</h3>
                <p>{formatDateTime(overview.status.nextEvent)}</p>
                <small>Plan ahead with the calendar below</small>
              </div>
            </div>
          ) : null}
          {overview && (
            <div className="announcement-bar">
              {overview.announcements.map((announcement) => (
                <article key={announcement.id} className="announcement">
                  <span className={`pill pill-${announcement.category.toLowerCase()}`}>
                    {announcement.category}
                  </span>
                  <h4>{announcement.title}</h4>
                  <p>{announcement.body}</p>
                  <time>{formatDateTime(announcement.date)}</time>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="events" className="panel">
          <header className="panel-header">
            <h2>Upcoming Events & Competitions</h2>
          </header>
          {overview && (
            <div className="card-grid three">
              {overview.events.map((event) => (
                <article key={event.id} className="card">
                  <header className="card-header">
                    <div>
                      <h3>{event.title}</h3>
                      <p className="meta">{event.category}</p>
                    </div>
                    <time>{formatDateTime(event.start)}</time>
                  </header>
                  <p className="card-body">{event.description}</p>
                  <footer className="card-footer">
                    <span>Host: {event.host}</span>
                    <span>Location: {event.location}</span>
                    <div className="tag-row">
                      {event.rewards.map((reward) => (
                        <span key={reward} className="tag">
                          {reward}
                        </span>
                      ))}
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="players" className="panel">
          <header className="panel-header">
            <h2>Player Intelligence</h2>
            <div className="input-group">
              <label htmlFor="player-search" className="sr-only">
                Search players
              </label>
              <input
                id="player-search"
                type="search"
                placeholder="Search by player or rank"
                value={playerFilter}
                onChange={(event) => setPlayerFilter(event.target.value)}
              />
            </div>
          </header>
          {overview && (
            <div className="player-table" role="table">
              <div className="player-row header" role="row">
                <div role="columnheader">Player</div>
                <div role="columnheader">Rank</div>
                <div role="columnheader">Playtime</div>
                <div role="columnheader">Balance</div>
                <div role="columnheader">Quests</div>
                <div role="columnheader">Status</div>
              </div>
              {filteredPlayers.map((player) => (
                <div key={player.name} className="player-row" role="row">
                  <div role="cell">{player.name}</div>
                  <div role="cell">{player.rank}</div>
                  <div role="cell">{player.playtimeHours} hrs</div>
                  <div role="cell">{player.balance.toLocaleString()} coins</div>
                  <div role="cell">{player.questsCompleted}</div>
                  <div role="cell">
                    <span className={`status-dot ${player.isOnline ? "online" : "offline"}`}>
                      {player.isOnline ? "Online" : `Last seen ${formatDateTime(player.lastSeen)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {overview && (
            <div className="guides">
              <aside className="guide-list">
                <h3>Training Guides</h3>
                <ul>
                  {overview.guides.map((guide) => (
                    <li key={guide.id}>
                      <button
                        className={guide.id === activeGuide?.id ? "active" : undefined}
                        onClick={() => setSelectedGuide(guide.id)}
                      >
                        {guide.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
              {activeGuide && (
                <article className="guide-detail">
                  <h4>{activeGuide.title}</h4>
                  <p>{activeGuide.summary}</p>
                  <ol>
                    {activeGuide.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </article>
              )}
            </div>
          )}
        </section>

        <section id="resources" className="panel">
          <header className="panel-header">
            <h2>Downloads & Knowledge Base</h2>
            <div className="segmented-control" role="group" aria-label="Resource type filter">
              {["All", "Mod Pack", "Data Pack", "Texture Pack", "Guide"].map((type) => (
                <button
                  key={type}
                  className={resourceFilter === type ? "active" : undefined}
                  onClick={() => setResourceFilter(type as typeof resourceFilter)}
                >
                  {type}
                </button>
              ))}
            </div>
          </header>
          {overview && (
            <div className="card-grid two">
              {filteredResources.map((resource) => (
                <article key={resource.id} className="card">
                  <header className="card-header">
                    <div>
                      <h3>{resource.name}</h3>
                      <p className="meta">{resource.type}</p>
                    </div>
                    <span className="pill">v{resource.version}</span>
                  </header>
                  <p className="card-body">{resource.description}</p>
                  <footer className="card-footer">
                    <span>{resource.sizeMB} MB</span>
                    <a className="button ghost" href={resource.downloadUrl} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </footer>
                </article>
              ))}
            </div>
          )}
          {overview && (
            <div className="support-articles">
              <h3>Popular Support Articles</h3>
              <div className="accordion">
                {overview.supportArticles.map((article) => (
                  <details key={article.id}>
                    <summary>
                      <span>{article.question}</span>
                      <div className="tag-row">
                        {article.tags.map((tag) => (
                          <span key={tag} className="tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </summary>
                    <p>{article.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </section>

        <section id="travel-tools" className="panel">
          <header className="panel-header">
            <h2>Travel & Economy Tools</h2>
          </header>
          <div className="tool-grid">
            <article className="card tool-card">
              <h3>Coordinate Converter</h3>
              <p>
                Switch dimensions without guesswork. Paste coordinates to convert between Overworld and Nether values using the
                8:1 ratio.
              </p>
              <div className="segmented-control" role="group" aria-label="Conversion direction">
                <button
                  className={coordinateMode === "OVERWORLD_TO_NETHER" ? "active" : undefined}
                  onClick={() => setCoordinateMode("OVERWORLD_TO_NETHER")}
                >
                  Overworld → Nether
                </button>
                <button
                  className={coordinateMode === "NETHER_TO_OVERWORLD" ? "active" : undefined}
                  onClick={() => setCoordinateMode("NETHER_TO_OVERWORLD")}
                >
                  Nether → Overworld
                </button>
              </div>
              <label htmlFor="coordinate-input" className="sr-only">
                Coordinates
              </label>
              <input
                id="coordinate-input"
                type="text"
                value={coordinateInput}
                onChange={(event) => setCoordinateInput(event.target.value)}
                placeholder="x, y, z"
              />
              <button className="button primary" onClick={handleCoordinateConvert}>
                Convert coordinates
              </button>
              <p className="result">{coordinateResult}</p>
            </article>

            <article className="card tool-card">
              <h3>Warp & Landmark Finder</h3>
              <p>Search public warps, transport hubs, and featured community builds.</p>
              <label htmlFor="warp-search" className="sr-only">
                Search warps
              </label>
              <input
                id="warp-search"
                type="search"
                value={warpQuery}
                onChange={(event) => setWarpQuery(event.target.value)}
                placeholder="Search by warp name, tag, or coordinate"
              />
              <div className="warp-results">
                {filteredWarps.map((warp) => (
                  <div key={warp.id} className="warp-item">
                    <h4>{warp.name}</h4>
                    <p>{warp.description}</p>
                    <div className="warp-meta">
                      <span>{warp.coordinates}</span>
                      <div className="tag-row">
                        {warp.tags.map((tag) => (
                          <span key={tag} className="tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="card tool-card">
              <h3>Marketplace Highlights</h3>
              <p>Browse trending player-run offers curated by the economy council.</p>
              <div className="market-grid">
                {overview?.marketplace.map((listing) => renderMarketplaceCard(listing))}
              </div>
            </article>
          </div>
        </section>

        <section id="support" className="panel">
          <header className="panel-header">
            <h2>Staff & Support</h2>
          </header>
          {overview && (
            <div className="staff-grid">
              {overview.staff.map((member) => (
                <article key={member.id} className="card staff-card">
                  <header className="card-header">
                    <h3>{member.name}</h3>
                    <span className="pill">{member.role}</span>
                  </header>
                  <p className="card-body">{member.bio}</p>
                  <footer className="card-footer">
                    <span>{member.timezone}</span>
                    <span>{member.availability}</span>
                  </footer>
                </article>
              ))}
            </div>
          )}

          <div className="forms">
            <form className="card form-card" onSubmit={handleTicketSubmit}>
              <h3>Submit a Support Ticket</h3>
              <div className="form-field">
                <label htmlFor="ticket-player">Minecraft IGN</label>
                <input id="ticket-player" name="player" placeholder="Your in-game name" required />
              </div>
              <div className="form-field">
                <label htmlFor="ticket-topic">Topic</label>
                <input id="ticket-topic" name="topic" placeholder="Claim issue, grief report, etc." required />
              </div>
              <div className="form-field">
                <label htmlFor="ticket-message">Explain your issue</label>
                <textarea id="ticket-message" name="message" rows={4} required />
              </div>
              <div className="form-field">
                <label htmlFor="ticket-contact">Discord tag or email (optional)</label>
                <input id="ticket-contact" name="contact" placeholder="Example: Nova#1234" />
              </div>
              <button className="button primary" disabled={ticketState.submitting}>
                {ticketState.submitting ? "Sending…" : "Send ticket"}
              </button>
              {ticketState.message && (
                <p className="result">
                  {ticketState.message}
                  {ticketState.reference && <strong> Reference: {ticketState.reference}</strong>}
                </p>
              )}
            </form>

            <form className="card form-card" onSubmit={handleFeedbackSubmit}>
              <h3>Share Feedback</h3>
              <div className="form-field">
                <label htmlFor="feedback-player">Minecraft IGN (optional)</label>
                <input id="feedback-player" name="player" placeholder="Leave blank for anonymous" />
              </div>
              <div className="form-field">
                <label htmlFor="feedback-rating">Server satisfaction: {feedbackRating}/5</label>
                <input
                  id="feedback-rating"
                  type="range"
                  name="rating"
                  min={1}
                  max={5}
                  value={feedbackRating}
                  onChange={(event) => setFeedbackRating(Number(event.target.value))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="feedback-message">Tell us more</label>
                <textarea id="feedback-message" name="message" rows={4} required />
              </div>
              <button className="button ghost" disabled={feedbackState.submitting}>
                {feedbackState.submitting ? "Submitting…" : "Send feedback"}
              </button>
              {feedbackState.message && <p className="result">{feedbackState.message}</p>}
            </form>
          </div>
        </section>

        {overview && (
          <section id="community" className="panel">
            <header className="panel-header">
              <h2>Keep the Community Thriving</h2>
            </header>
            <div className="community-grid">
              <article className="card community-card">
                <h3>Vote & Earn Daily Rewards</h3>
                <p>Support CommunitySMP on partner sites and unlock vote keys and cosmetics.</p>
                <ul className="link-list">
                  {overview.voteSites.map((site) => (
                    <li key={site.id}>
                      <a href={site.url} target="_blank" rel="noreferrer">
                        {site.name}
                      </a>
                      <span>{site.reward}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="card community-card">
                <h3>Announcement Archive</h3>
                <p>Stay informed with the latest developments, maintenance windows, and contest winners.</p>
                <ul>
                  {overview.announcements.slice(0, 3).map((announcement) => (
                    <li key={`archive-${announcement.id}`}>
                      <strong>{announcement.title}</strong>
                      <span>{formatDateTime(announcement.date)}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="card community-card">
                <h3>Need more help?</h3>
                <p>
                  Join our Discord community to chat with staff, share builds, and get notified when new CommunitySMP services go
                  live.
                </p>
                <a className="button primary" href="https://discord.gg/communitysmp" target="_blank" rel="noreferrer">
                  Join the Discord
                </a>
              </article>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>CommunitySMP &copy; {new Date().getFullYear()} • Crafted for our players with love and redstone.</p>
        <p className="footer-meta">Not affiliated with Mojang or Microsoft.</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
