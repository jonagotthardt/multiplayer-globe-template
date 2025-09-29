import type { Warp } from "../../shared";

type TravelToolsProps = {
  warps: Warp[];
  warpQuery: string;
  onWarpQueryChange: (value: string) => void;
  coordinateMode: "OVERWORLD_TO_NETHER" | "NETHER_TO_OVERWORLD";
  onCoordinateModeChange: (value: TravelToolsProps["coordinateMode"]) => void;
  coordinateInput: string;
  onCoordinateInputChange: (value: string) => void;
  coordinateResult: string;
  onConvert: () => void;
};

export const TravelTools = ({
  warps,
  warpQuery,
  onWarpQueryChange,
  coordinateMode,
  onCoordinateModeChange,
  coordinateInput,
  onCoordinateInputChange,
  coordinateResult,
  onConvert,
}: TravelToolsProps) => (
  <div className="travel-tools">
    <div className="warp-search">
      <label htmlFor="warp-query">Warps & Hotspots</label>
      <input
        id="warp-query"
        type="search"
        placeholder="Suche nach Namen, Tags oder Koordinaten"
        value={warpQuery}
        onChange={(event) => onWarpQueryChange(event.target.value)}
      />
      <ul className="warp-list">
        {warps.map((warp) => (
          <li key={warp.id}>
            <h4>{warp.name}</h4>
            <p>{warp.description}</p>
            <span className="warp-coordinates">{warp.coordinates}</span>
            <div className="warp-tags">
              {warp.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {warps.length === 0 ? <p className="muted">Keine Warps gefunden.</p> : null}
    </div>

    <div className="coordinate-tool">
      <h3>Koordinaten-Rechner</h3>
      <div className="coordinate-mode">
        <label>
          <input
            type="radio"
            name="coordinate-mode"
            value="OVERWORLD_TO_NETHER"
            checked={coordinateMode === "OVERWORLD_TO_NETHER"}
            onChange={(event) => onCoordinateModeChange(event.target.value as TravelToolsProps["coordinateMode"])}
          />
          Overworld → Nether
        </label>
        <label>
          <input
            type="radio"
            name="coordinate-mode"
            value="NETHER_TO_OVERWORLD"
            checked={coordinateMode === "NETHER_TO_OVERWORLD"}
            onChange={(event) => onCoordinateModeChange(event.target.value as TravelToolsProps["coordinateMode"])}
          />
          Nether → Overworld
        </label>
      </div>
      <textarea
        value={coordinateInput}
        onChange={(event) => onCoordinateInputChange(event.target.value)}
        rows={3}
      />
      <button type="button" onClick={onConvert}>
        Umrechnen
      </button>
      <output>{coordinateResult}</output>
    </div>
  </div>
);
