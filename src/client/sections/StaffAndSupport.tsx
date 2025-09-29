import type { FormEvent } from "react";

import type { StaffMember, SupportArticle, VoteSite } from "../../shared";

type StaffAndSupportProps = {
  staff: StaffMember[];
  supportArticles: SupportArticle[];
  voteSites: VoteSite[];
  onSubmitTicket: (event: FormEvent<HTMLFormElement>) => void;
  ticketState: { submitting: boolean; message: string; reference?: string };
  onSubmitFeedback: (event: FormEvent<HTMLFormElement>) => void;
  feedbackState: { submitting: boolean; message: string };
  feedbackRating: number;
  onFeedbackRatingChange: (value: number) => void;
};

const renderSupportState = (state: StaffAndSupportProps["ticketState"]) => {
  if (state.submitting) return <span className="badge">Wird gesendet...</span>;
  if (!state.message) return null;
  return <p className="feedback-message">{state.reference ? `${state.message} (Referenz: ${state.reference})` : state.message}</p>;
};

const renderFeedbackState = (state: StaffAndSupportProps["feedbackState"]) => {
  if (state.submitting) return <span className="badge">Wird gesendet...</span>;
  if (!state.message) return null;
  return <p className="feedback-message">{state.message}</p>;
};

export const StaffAndSupport = ({
  staff,
  supportArticles,
  voteSites,
  onSubmitTicket,
  ticketState,
  onSubmitFeedback,
  feedbackState,
  feedbackRating,
  onFeedbackRatingChange,
}: StaffAndSupportProps) => (
  <div className="support-area">
    <div className="staff-roster">
      <h3>Staff-Team</h3>
      <ul>
        {staff.map((member) => (
          <li key={member.id}>
            <h4>{member.name}</h4>
            <span className="staff-role">{member.role}</span>
            <p>{member.bio}</p>
            <dl>
              <div>
                <dt>Zeitzone</dt>
                <dd>{member.timezone}</dd>
              </div>
              <div>
                <dt>Verfügbarkeit</dt>
                <dd>{member.availability}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      {staff.length === 0 ? <p className="muted">Keine Staff-Mitglieder hinterlegt.</p> : null}
    </div>

    <div className="support-forms">
      <form className="support-form" onSubmit={onSubmitTicket}>
        <h3>Support-Ticket senden</h3>
        <label>
          Spielername
          <input name="player" type="text" placeholder="Dein IGN" required />
        </label>
        <label>
          Thema
          <input name="topic" type="text" placeholder="Worum geht es?" required />
        </label>
        <label>
          Nachricht
          <textarea name="message" rows={4} placeholder="Beschreibe dein Anliegen" required />
        </label>
        <label>
          Kontaktmöglichkeit (optional)
          <input name="contact" type="text" placeholder="Discord, E-Mail..." />
        </label>
        <button type="submit" disabled={ticketState.submitting}>
          Ticket senden
        </button>
        {renderSupportState(ticketState)}
      </form>

      <form className="support-form" onSubmit={onSubmitFeedback}>
        <h3>Feedback geben</h3>
        <label>
          Spielername
          <input name="player" type="text" placeholder="Dein IGN" required />
        </label>
        <label className="rating-control">
          Bewertung
          <input
            type="range"
            min="1"
            max="5"
            value={feedbackRating}
            onChange={(event) => onFeedbackRatingChange(Number.parseInt(event.target.value, 10))}
          />
          <span>{feedbackRating}/5</span>
        </label>
        <label>
          Nachricht
          <textarea name="message" rows={3} placeholder="Was sollen wir verbessern?" required />
        </label>
        <button type="submit" disabled={feedbackState.submitting}>
          Feedback senden
        </button>
        {renderFeedbackState(feedbackState)}
      </form>
    </div>

    <div className="support-knowledge">
      <h3>Wissensdatenbank</h3>
      <ul>
        {supportArticles.map((article) => (
          <li key={article.id}>
            <details>
              <summary>
                <span className="article-category">{article.category}</span>
                {article.question}
              </summary>
              <p>{article.answer}</p>
            </details>
          </li>
        ))}
      </ul>
      {supportArticles.length === 0 ? <p className="muted">Noch keine Artikel vorhanden.</p> : null}

      <h3>Vote-Seiten</h3>
      <ul className="vote-sites">
        {voteSites.map((site) => (
          <li key={site.id}>
            <a href={site.url} target="_blank" rel="noreferrer">
              {site.name}
            </a>
            <span>{site.reward}</span>
          </li>
        ))}
      </ul>
      {voteSites.length === 0 ? <p className="muted">Trage deine Vote-Links ein, um Belohnungen zu erhalten.</p> : null}
    </div>
  </div>
);
