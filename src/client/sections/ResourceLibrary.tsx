import type { ResourcePack } from "../../shared";

type ResourceLibraryProps = {
  resources: ResourcePack[];
  resourceFilter: ResourcePack["type"] | "Alle";
  onFilterChange: (filter: ResourceLibraryProps["resourceFilter"]) => void;
};

export const ResourceLibrary = ({ resources, resourceFilter, onFilterChange }: ResourceLibraryProps) => (
  <div className="resource-library">
    <div className="resource-filter">
      <label htmlFor="resource-filter">Kategorie</label>
      <select
        id="resource-filter"
        value={resourceFilter}
        onChange={(event) => onFilterChange(event.target.value as ResourceLibraryProps["resourceFilter"])}
      >
        <option value="Alle">Alle</option>
        <option value="Mod Pack">Mod Packs</option>
        <option value="Data Pack">Data Packs</option>
        <option value="Texture Pack">Texture Packs</option>
        <option value="Guide">Guides</option>
      </select>
    </div>
    <div className="resource-grid">
      {resources.map((resource) => (
        <article key={resource.id} className="resource-card">
          <header>
            <span className="resource-type">{resource.type}</span>
            <h3>{resource.name}</h3>
          </header>
          <p>{resource.description}</p>
          <dl>
            <div>
              <dt>Version</dt>
              <dd>{resource.version}</dd>
            </div>
            <div>
              <dt>Größe</dt>
              <dd>{resource.sizeMB} MB</dd>
            </div>
          </dl>
          <a className="button" href={resource.downloadUrl} target="_blank" rel="noreferrer">
            Download
          </a>
        </article>
      ))}
    </div>
    {resources.length === 0 ? <p className="muted">Keine Ressourcen gefunden.</p> : null}
  </div>
);
