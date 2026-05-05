import ActiveEventCard from '../components/ActiveEventCard';
import EventSelector from '../components/EventSelector';
import LivePieChart from '../components/LivePieChart';
import ScheduleCard from '../components/ScheduleCard';

function LiveCountsPage({ activeEvent, events, occupancy, setActiveEventId, soldPercent }) {
  if (!activeEvent) {
    return (
      <section className="solo-page">
        <section className="data-card page-card empty-ticket">
          <div className="section-heading">
            <p>No live data</p>
            <h2>Create an event first</h2>
          </div>
          <p className="small-note">Live counts will appear once your database has events.</p>
        </section>
      </section>
    );
  }

  return (
    <section className="page-grid">
      <EventSelector
        activeEvent={activeEvent}
        events={events}
        setActiveEventId={setActiveEventId}
      />
      <div className="page-main">
        <section className="live-panel page-card">
          <div>
            <p>Live attendee count</p>
            <h3>{activeEvent.checkedIn} checked in</h3>
            <span>{activeEvent.ticketsSold} tickets sold</span>
          </div>
          <div className="progress-block">
            <span>{soldPercent}% sold</span>
            <div className="progress-track">
              <span style={{ width: `${soldPercent}%` }} />
            </div>
            <span>{occupancy}% of venue capacity currently inside</span>
          </div>
        </section>
        <div className="two-column">
          <ActiveEventCard activeEvent={activeEvent} occupancy={occupancy} />
          <LivePieChart activeEvent={activeEvent} />
        </div>
        <div className="two-column">
          <section className="data-card">
            <div className="section-heading">
              <p>Operations</p>
              <h2>Live signals</h2>
            </div>
            <div className="signal-list">
              <span>Average entry time <strong>18 sec</strong></span>
              <span>Peak arrival window <strong>7:30 PM</strong></span>
              <span>VIP arrivals <strong>{activeEvent.vipGuests}</strong></span>
              <span>Support requests <strong>12 open</strong></span>
            </div>
          </section>
        </div>
        <ScheduleCard activeEvent={activeEvent} />
      </div>
    </section>
  );
}

export default LiveCountsPage;
