import type { Event } from "../../shared";

type EventsShowcaseProps = {
  events: Event[];
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const EventsShowcase = ({ events }: EventsShowcaseProps) => (
  <div className="events">
    {events.length === 0 ? (
      <p className="muted">Keine geplanten Events. Schau später wieder vorbei!</p>
    ) : (
      <div className="event-grid">
        {events.map((event) => (
          <article key={event.id} className={`event-card event-card--${event.category.toLowerCase()}`}>
            <header>
              <span className="event-category">{event.category}</span>
              <h3>{event.title}</h3>
            </header>
            <p>{event.description}</p>
            <ul className="event-meta">
              <li>
                <strong>Wann:</strong> {formatDateTime(event.start)}
              </li>
              <li>
                <strong>Wo:</strong> {event.location}
              </li>
              <li>
                <strong>Host:</strong> {event.host}
              </li>
            </ul>
            <footer>
              <strong>Belohnungen</strong>
              <ul className="event-rewards">
                {event.rewards.map((reward) => (
                  <li key={reward}>{reward}</li>
                ))}
              </ul>
            </footer>
          </article>
        ))}
      </div>
    )}
  </div>
);
