import type { ServerStatus } from "../../shared";

type ServerStatusPanelProps = {
  status: ServerStatus | null;
  loading: boolean;
  error: string | null;
};

const formatDate = (value: string) => new Date(value).toLocaleString();

export const ServerStatusPanel = ({ status, loading, error }: ServerStatusPanelProps) => (
  <div className="status-panel">
    <div className="status-panel__header">
      <h3>Aktueller Überblick</h3>
      {loading ? <span className="badge">Lädt...</span> : null}
      {error ? <span className="badge badge--error">{error}</span> : null}
    </div>
    {status ? (
      <div className="status-grid">
        <div className="status-card">
          <span>Online</span>
          <strong>{status.online ? "Ja" : "Nein"}</strong>
        </div>
        <div className="status-card">
          <span>Spieler</span>
          <strong>
            {status.playerCount} / {status.maxPlayers}
          </strong>
        </div>
        <div className="status-card">
          <span>Warteschlange</span>
          <strong>{status.queueLength}</strong>
        </div>
        <div className="status-card">
          <span>TPS</span>
          <strong>{status.tps.toFixed(1)}</strong>
        </div>
        <div className="status-card">
          <span>Version</span>
          <strong>{status.version}</strong>
        </div>
        <div className="status-card">
          <span>Nächster Restart</span>
          <strong>{formatDate(status.lastRestart)}</strong>
        </div>
        <div className="status-card">
          <span>Nächste Aktivität</span>
          <strong>{formatDate(status.nextEvent)}</strong>
        </div>
        <div className="status-card status-card--wide">
          <span>MotD</span>
          <strong>{status.motd}</strong>
        </div>
      </div>
    ) : (
      <p className="status-placeholder">Keine Statusdaten verfügbar.</p>
    )}
  </div>
);
