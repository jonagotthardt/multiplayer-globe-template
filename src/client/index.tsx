import "./styles.css";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import type {
  Announcement,
  ApiOverviewResponse,
  FeedbackRequest,
  FeedbackResponse,
  ResourcePack,
  TicketRequest,
  TicketResponse,
  Warp,
} from "../shared";

import { AnnouncementFeed } from "./sections/AnnouncementFeed";
import { EventsShowcase } from "./sections/EventsShowcase";
import { Hero } from "./sections/Hero";
import { MarketplaceShowcase } from "./sections/MarketplaceShowcase";
import { PlayerIntel } from "./sections/PlayerIntel";
import { ResourceLibrary } from "./sections/ResourceLibrary";
import { Section } from "./sections/Section";
import { ServerStatusPanel } from "./sections/ServerStatusPanel";
import { StaffAndSupport } from "./sections/StaffAndSupport";
import { TravelTools } from "./sections/TravelTools";

const coordinateConverter = (mode: "OVERWORLD_TO_NETHER" | "NETHER_TO_OVERWORLD", value: string) => {
  const [x, y, z] = value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((point) => Number.parseFloat(point));

  if ([x, y, z].some((point) => Number.isNaN(point))) {
    return "Bitte gib drei numerische Koordinaten an.";
  }

  const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

  if (mode === "OVERWORLD_TO_NETHER") {
    return `Nether: ${formatter.format(x / 8)} / ${formatter.format(y)} / ${formatter.format(z / 8)}`;
  }

  return `Overworld: ${formatter.format(x * 8)} / ${formatter.format(y)} / ${formatter.format(z * 8)}`;
};

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const useOverviewData = (): FetchState<ApiOverviewResponse> & { refresh: () => void } => {
  const [state, setState] = useState<FetchState<ApiOverviewResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const load = () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    fetch("/api/overview")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Übersicht (Status ${response.status})`);
        }

        const payload = (await response.json()) as ApiOverviewResponse;
        setState({ data: payload, loading: false, error: null });
      })
      .catch((error: unknown) => {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unbekannter Fehler",
        });
      });
  };

  useEffect(() => {
    load();
  }, []);

  return { ...state, refresh: load };
};

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const App = () => {
  const { data, loading, error, refresh } = useOverviewData();

  const [playerQuery, setPlayerQuery] = useState("");
  const [resourceFilter, setResourceFilter] = useState<ResourcePack["type"] | "Alle">("Alle");
  const [guideId, setGuideId] = useState<string | null>(null);
  const [warpQuery, setWarpQuery] = useState("");
  const [coordinateMode, setCoordinateMode] = useState<"OVERWORLD_TO_NETHER" | "NETHER_TO_OVERWORLD">(
    "OVERWORLD_TO_NETHER",
  );
  const [coordinateInput, setCoordinateInput] = useState("0, 0, 0");
  const [coordinateResult, setCoordinateResult] = useState(
    "Gib Koordinaten ein, um sie zwischen den Dimensionen umzuwandeln.",
  );
  const [ticketState, setTicketState] = useState<{ submitting: boolean; message: string; reference?: string }>(
    { submitting: false, message: "" },
  );
  const [feedbackState, setFeedbackState] = useState<{ submitting: boolean; message: string }>(
    { submitting: false, message: "" },
  );
  const [feedbackRating, setFeedbackRating] = useState(4);

  useEffect(() => {
    if (data && !guideId && data.guides.length > 0) {
      setGuideId(data.guides[0].id);
    }
  }, [data, guideId]);

  const filteredAnnouncements = useMemo<Announcement[]>(() => {
    if (!data) return [];
    return [...data.announcements].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    return data.events.filter((event) => new Date(event.start).getTime() >= Date.now());
  }, [data]);

  const filteredPlayers = useMemo(() => {
    if (!data) return [];
    const query = playerQuery.trim().toLowerCase();
    if (!query) return data.topPlayers;
    return data.topPlayers.filter((player) =>
      [player.name, player.rank].some((value) => value.toLowerCase().includes(query)),
    );
  }, [data, playerQuery]);

  const filteredResources = useMemo(() => {
    if (!data) return [];
    if (resourceFilter === "Alle") return data.resources;
    return data.resources.filter((resource) => resource.type === resourceFilter);
  }, [data, resourceFilter]);

  const filteredWarps = useMemo<Warp[]>(() => {
    if (!data) return [];
    const query = warpQuery.trim().toLowerCase();
    if (!query) return data.warps;
    return data.warps.filter((warp) =>
      [warp.name, warp.description, warp.coordinates, ...warp.tags]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [data, warpQuery]);

  const handleCoordinateConvert = () => {
    setCoordinateResult(coordinateConverter(coordinateMode, coordinateInput));
  };

  const submitTicket = async (payload: TicketRequest) => {
    setTicketState({ submitting: true, message: "" });
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Support-Ticket konnte nicht gesendet werden (Status ${response.status})`);
      }

      const result = (await response.json()) as TicketResponse;
      setTicketState({
        submitting: false,
        message: result.message,
        reference: result.reference,
      });
    } catch (err) {
      setTicketState({
        submitting: false,
        message: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    }
  };

  const submitFeedback = async (payload: FeedbackRequest) => {
    setFeedbackState({ submitting: true, message: "" });
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Feedback konnte nicht gesendet werden (Status ${response.status})`);
      }

      const result = (await response.json()) as FeedbackResponse;
      setFeedbackState({ submitting: false, message: result.message });
    } catch (err) {
      setFeedbackState({
        submitting: false,
        message: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    }
  };

  return (
    <div className="app">
      <Hero onNavigate={scrollTo} onRefresh={refresh} status={data?.status} loading={loading} />
      <main>
        <Section id="status" title="Server Status" description="Echtzeitüberblick zum CommunitySMP.">
          <ServerStatusPanel status={data?.status ?? null} loading={loading} error={error} />
          <AnnouncementFeed announcements={filteredAnnouncements} />
        </Section>

        <Section
          id="events"
          title="Events & Highlights"
          description="Plan deine nächsten Abenteuer mit Turnieren, Wettbewerben und Community-Aktionen."
        >
          <EventsShowcase events={filteredEvents} />
        </Section>

        <Section
          id="players"
          title="Spieler-Intelligence"
          description="Finde heraus, wer gerade glänzt, und nutze Guides, um selbst besser zu werden."
        >
          <PlayerIntel
            players={filteredPlayers}
            query={playerQuery}
            onQueryChange={setPlayerQuery}
            guides={data?.guides ?? []}
            activeGuideId={guideId}
            onSelectGuide={setGuideId}
          />
        </Section>

        <Section
          id="resources"
          title="Downloads & Ressourcen"
          description="Hol dir offizielle Packs, Tools und Dokumente für deinen perfekten Start."
        >
          <ResourceLibrary
            resources={filteredResources}
            resourceFilter={resourceFilter}
            onFilterChange={setResourceFilter}
          />
        </Section>

        <Section
          id="travel"
          title="Reise & Wirtschaft"
          description="Nutze unsere Werkzeuge für Warps, Handelsplätze und Dimensionen."
        >
          <TravelTools
            warps={filteredWarps}
            warpQuery={warpQuery}
            onWarpQueryChange={setWarpQuery}
            coordinateMode={coordinateMode}
            onCoordinateModeChange={setCoordinateMode}
            coordinateInput={coordinateInput}
            onCoordinateInputChange={setCoordinateInput}
            coordinateResult={coordinateResult}
            onConvert={handleCoordinateConvert}
          />
          <MarketplaceShowcase listings={data?.marketplace ?? []} />
        </Section>

        <Section
          id="support"
          title="Team & Support"
          description="Wir sind für dich da – kontaktiere das Staff-Team oder gib uns Feedback."
        >
          <StaffAndSupport
            staff={data?.staff ?? []}
            supportArticles={data?.supportArticles ?? []}
            voteSites={data?.voteSites ?? []}
            onSubmitTicket={(event: FormEvent<HTMLFormElement>) => {
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
                setTicketState({
                  submitting: false,
                  message: "Bitte fülle Spielername, Thema und Nachricht aus.",
                });
                return;
              }

              void submitTicket(payload).then(() => form.reset());
            }}
            ticketState={ticketState}
            onSubmitFeedback={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formData = new FormData(form);
              const payload: FeedbackRequest = {
                player: (formData.get("player") as string)?.trim(),
                rating: feedbackRating,
                message: (formData.get("message") as string)?.trim(),
              };

              if (!payload.player || !payload.message) {
                setFeedbackState({
                  submitting: false,
                  message: "Bitte teile uns deinen Spielernamen und deine Nachricht mit.",
                });
                return;
              }

              void submitFeedback(payload).then(() => form.reset());
            }}
            feedbackState={feedbackState}
            feedbackRating={feedbackRating}
            onFeedbackRatingChange={setFeedbackRating}
          />
        </Section>
      </main>
      <footer className="footer">
        <div>
          <strong>CommunitySMP Hub</strong>
          <span>Dein Kompass für alles rund um unseren Minecraft-Server.</span>
        </div>
        <button className="back-to-top" type="button" onClick={() => scrollTo("top")}>Zurück nach oben</button>
      </footer>
    </div>
  );
};

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
