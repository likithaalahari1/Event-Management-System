function ScheduleCard({ activeEvent }) {
  return (
    <section className="data-card">
      <div className="section-heading">
        <p>Program</p>
        <h2>Schedule</h2>
      </div>
      <div className="schedule-list">
        {activeEvent.schedule.map((item) => (
          <article key={`${item.time}-${item.title}`}>
            <time>{item.time}</time>
            <div>
              <strong>{item.title}</strong>
              <span>{item.location}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ScheduleCard;
