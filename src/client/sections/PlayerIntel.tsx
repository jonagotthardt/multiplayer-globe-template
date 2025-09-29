import type { PlayerStat, TrainingGuide } from "../../shared";

type PlayerIntelProps = {
  players: PlayerStat[];
  query: string;
  onQueryChange: (value: string) => void;
  guides: TrainingGuide[];
  activeGuideId: string | null;
  onSelectGuide: (id: string) => void;
};

const formatHours = (hours: number) => `${hours}h`;
const formatCurrency = (value: number) => `${value.toLocaleString()} Coins`;

export const PlayerIntel = ({
  players,
  query,
  onQueryChange,
  guides,
  activeGuideId,
  onSelectGuide,
}: PlayerIntelProps) => {
  const activeGuide = guides.find((guide) => guide.id === activeGuideId) ?? guides[0] ?? null;

  return (
    <div className="player-intel">
      <div className="player-search">
        <label htmlFor="player-query">Top-Spieler durchsuchen</label>
        <input
          id="player-query"
          type="search"
          placeholder="IGN, Rang..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <div className="player-grid">
        {players.map((player) => (
          <article key={player.name} className={`player-card player-card--${player.rank.toLowerCase()}`}>
            <header>
              <h3>{player.name}</h3>
              <span className="player-rank">{player.rank}</span>
            </header>
            <dl>
              <div>
                <dt>Playtime</dt>
                <dd>{formatHours(player.playtimeHours)}</dd>
              </div>
              <div>
                <dt>Kontostand</dt>
                <dd>{formatCurrency(player.balance)}</dd>
              </div>
              <div>
                <dt>Quests</dt>
                <dd>{player.questsCompleted}</dd>
              </div>
              <div>
                <dt>Zuletzt gesehen</dt>
                <dd>{new Date(player.lastSeen).toLocaleString()}</dd>
              </div>
            </dl>
            <footer className={player.isOnline ? "online" : "offline"}>
              {player.isOnline ? "Online" : "Offline"}
            </footer>
          </article>
        ))}
      </div>
      <div className="guide-panel">
        <div className="guide-list">
          <h3>Training-Guides</h3>
          <ul>
            {guides.map((guide) => (
              <li key={guide.id}>
                <button
                  type="button"
                  className={guide.id === activeGuide?.id ? "active" : ""}
                  onClick={() => onSelectGuide(guide.id)}
                >
                  {guide.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {activeGuide ? (
          <article className="guide-detail">
            <header>
              <h3>{activeGuide.title}</h3>
              <p>{activeGuide.summary}</p>
            </header>
            <ol>
              {activeGuide.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </article>
        ) : (
          <p className="muted">Keine Guides verfügbar.</p>
        )}
      </div>
    </div>
  );
};
