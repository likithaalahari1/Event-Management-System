function TierBreakdown({ activeEvent }) {
  return (
    <section className="data-card">
      <div className="section-heading">
        <p>Inventory</p>
        <h2>Ticket tiers</h2>
      </div>
      <div className="tier-list">
        {activeEvent.tiers.map((tier) => {
          const tierPercent = Math.round((tier.sold / tier.capacity) * 100);

          return (
            <article key={tier.name}>
              <div>
                <strong>{tier.name}</strong>
                <span>Rs {tier.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="progress-track">
                <span style={{ width: `${tierPercent}%` }} />
              </div>
              <small>{tier.sold} / {tier.capacity} sold</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default TierBreakdown;
