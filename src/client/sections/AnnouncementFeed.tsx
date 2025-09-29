import type { Announcement } from "../../shared";

type AnnouncementFeedProps = {
  announcements: Announcement[];
};

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export const AnnouncementFeed = ({ announcements }: AnnouncementFeedProps) => (
  <div className="announcement-feed">
    <h3>Aktuelle Meldungen</h3>
    {announcements.length === 0 ? (
      <p className="muted">Keine Neuigkeiten verfügbar.</p>
    ) : (
      <ul>
        {announcements.map((announcement) => (
          <li key={announcement.id} className={`announcement announcement--${announcement.category.toLowerCase()}`}>
            <div>
              <span className="announcement-category">{announcement.category}</span>
              <h4>{announcement.title}</h4>
              <p>{announcement.body}</p>
            </div>
            <time dateTime={announcement.date}>{formatDate(announcement.date)}</time>
          </li>
        ))}
      </ul>
    )}
  </div>
);
