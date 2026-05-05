function LivePieChart({ activeEvent }) {
  const checkedPercent = Math.round((activeEvent.checkedIn / activeEvent.capacity) * 100);
  const bookedOnlyPercent = Math.round(
    ((activeEvent.ticketsSold - activeEvent.checkedIn) / activeEvent.capacity) * 100,
  );
  const remainingPercent = Math.max(100 - checkedPercent - bookedOnlyPercent, 0);

  return (
    <section className="data-card pie-card">
      <div className="section-heading">
        <p>Live mix</p>
        <h2>Ticket status</h2>
      </div>
      <div
        className="pie-chart"
        style={{
          '--checked': `${checkedPercent}%`,
          '--booked': `${checkedPercent + bookedOnlyPercent}%`,
        }}
        aria-label="Pie chart showing checked in, booked, and available tickets"
      >
        <strong>{activeEvent.ticketsSold}</strong>
        <span>booked</span>
      </div>
      <div className="pie-legend">
        <span><i className="checked" />Checked in {checkedPercent}%</span>
        <span><i className="booked" />Booked waiting {bookedOnlyPercent}%</span>
        <span><i className="remaining" />Available {remainingPercent}%</span>
      </div>
    </section>
  );
}

export default LivePieChart;
