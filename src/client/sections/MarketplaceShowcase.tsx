import type { MarketplaceListing } from "../../shared";

type MarketplaceShowcaseProps = {
  listings: MarketplaceListing[];
};

export const MarketplaceShowcase = ({ listings }: MarketplaceShowcaseProps) => (
  <div className="marketplace">
    <h3>Community-Marktplatz</h3>
    <div className="marketplace-grid">
      {listings.map((listing) => (
        <article key={listing.id} className="marketplace-card">
          <header>
            <h4>{listing.title}</h4>
            <span className="marketplace-price">{listing.price.toLocaleString()} Coins</span>
          </header>
          <p>{listing.description}</p>
          <footer>
            <span>Verkäufer: {listing.seller}</span>
            <div className="marketplace-tags">
              {listing.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </footer>
        </article>
      ))}
    </div>
    {listings.length === 0 ? <p className="muted">Zurzeit sind keine Angebote gelistet.</p> : null}
  </div>
);
