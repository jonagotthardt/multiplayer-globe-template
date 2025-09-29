import type { ServerStatus } from "../../shared";

type HeroProps = {
  onNavigate: (id: string) => void;
  onRefresh: () => void;
  status: ServerStatus | undefined;
  loading: boolean;
};

const formatStatus = (status: ServerStatus | undefined) => {
  if (!status) return "Status unbekannt";
  return status.online
    ? `${status.playerCount}/${status.maxPlayers} Spieler online`
    : "Server offline";
};

export const Hero = ({ onNavigate, onRefresh, status, loading }: HeroProps) => (
  <header className="hero" id="top">
    <div className="hero-content">
      <p className="hero-eyebrow">CommunitySMP</p>
      <h1>Dein multifunktionales Spieler-Portal</h1>
      <p className="hero-subtitle">
        Status, Events, Guides, Tools und Support – alles an einem Ort, optimiert für unsere Minecraft-Community.
      </p>
      <div className="hero-actions">
        <button type="button" onClick={() => onNavigate("status")}>
          Live-Status
        </button>
        <button type="button" onClick={() => onNavigate("events")}>Events</button>
        <button type="button" onClick={() => onNavigate("support")}>Support</button>
      </div>
    </div>
    <aside className="hero-sidebar">
      <div className="hero-card">
        <span className="hero-card-label">Serverstatus</span>
        <strong>{loading ? "Aktualisiere..." : formatStatus(status)}</strong>
        <button type="button" onClick={onRefresh} className="link-button">
          Aktualisieren
        </button>
      </div>
      <ul className="hero-nav">
        <li>
          <button type="button" onClick={() => onNavigate("players")}>Spieler</button>
        </li>
        <li>
          <button type="button" onClick={() => onNavigate("resources")}>Ressourcen</button>
        </li>
        <li>
          <button type="button" onClick={() => onNavigate("travel")}>Reise & Wirtschaft</button>
        </li>
      </ul>
    </aside>
  </header>
);
