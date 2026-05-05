import { useEffect, useMemo, useState } from 'react';
import ActiveEventCard from '../components/ActiveEventCard';
import BookingFeed from '../components/BookingFeed';
import EventSelector from '../components/EventSelector';
import LivePieChart from '../components/LivePieChart';
import ScheduleCard from '../components/ScheduleCard';
import TierBreakdown from '../components/TierBreakdown';

function DashboardPage({
  activeEvent,
  bookings,
  events,
  occupancy,
  totals,
  setActiveEventId,
  onDeleteEvent,
  onEditEvent,
  setPage,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return events;
    }

    return events.filter((event) =>
      [event.name, event.venue, event.category, event.status]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [events, searchTerm]);

  useEffect(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!activeEvent || !normalizedSearch || !filteredEvents.length) {
      return;
    }

    if (!filteredEvents.some((event) => event.id === activeEvent.id)) {
      setActiveEventId(filteredEvents[0].id);
    }
  }, [activeEvent, filteredEvents, searchTerm, setActiveEventId]);

  if (!activeEvent) {
    return (
      <section className="solo-page">
        <section className="data-card page-card empty-ticket">
          <div className="section-heading">
            <p>No events yet</p>
            <h2>Create your first event</h2>
          </div>
          <p className="small-note">
            Your dashboard will show only events saved in the Django database.
          </p>
          <button className="wide-button create-button" onClick={() => setPage('create')} type="button">
            Create event
          </button>
        </section>
      </section>
    );
  }

  return (
    <section className="page-grid">
      <EventSelector
        activeEvent={activeEvent}
        events={filteredEvents}
        setActiveEventId={setActiveEventId}
      />
      <div className="page-main">
        <section className="dashboard-search">
          <label>
            Search events
            <input
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by event, venue, category, or status"
              value={searchTerm}
            />
          </label>
          <span>{filteredEvents.length} of {events.length} events</span>
        </section>
        {!filteredEvents.length && (
          <section className="search-empty-state">
            No matching events found.
          </section>
        )}
        <ActiveEventCard
          activeEvent={activeEvent}
          occupancy={occupancy}
          onDelete={onDeleteEvent}
          onEdit={onEditEvent}
        />
        <section className="overview-panel" aria-label="Event overview">
          <div className="overview-heading">
            <p>Today&apos;s overview</p>
            <h2>Event activity at a glance</h2>
          </div>
          <div className="metrics-grid">
            <article>
              <span>Tickets booked</span>
              <strong>{totals.sold.toLocaleString('en-IN')}</strong>
              <small>{events.length} active events</small>
            </article>
            <article>
              <span>Guests arrived</span>
              <strong>{totals.checkedIn.toLocaleString('en-IN')}</strong>
              <small>{totals.entryRate}% checked in</small>
            </article>
            <article>
              <span>Collected amount</span>
              <strong>Rs {totals.revenue.toLocaleString('en-IN')}</strong>
              <small>Confirmed bookings</small>
            </article>
            <article>
              <span>Waiting requests</span>
              <strong>{totals.waitlist}</strong>
              <small>Pending seats</small>
            </article>
          </div>
        </section>
        <section className="quick-actions">
          <button onClick={() => setPage('create')} type="button">Create event</button>
          <button onClick={() => setPage('tickets')} type="button">Book tickets</button>
          <button onClick={() => setPage('counts')} type="button">View live counts</button>
        </section>
        <div className="two-column">
          <TierBreakdown activeEvent={activeEvent} />
          <LivePieChart activeEvent={activeEvent} />
        </div>
        <div className="two-column">
          <ScheduleCard activeEvent={activeEvent} />
          <BookingFeed bookings={bookings} />
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
