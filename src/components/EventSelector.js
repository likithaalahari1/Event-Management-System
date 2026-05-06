import { formatDate } from '../utils/formatters';
import { useState } from 'react';

function EventSelector({ activeEvent, events, setActiveEventId }) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const visibleEvents = showAllEvents ? events : events.slice(0, 5);
  const hiddenCount = Math.max(events.length - visibleEvents.length, 0);

  return (
    <aside className="event-list" aria-label="Event list">
      <div className="section-heading">
        <p>Portfolio</p>
        <h2>Events</h2>
      </div>
      {visibleEvents.map((event) => {
        const soldPercent = Math.round((event.ticketsSold / event.capacity) * 100);

        return (
          <button
            className={`event-row ${event.id === activeEvent?.id ? 'active' : ''}`}
            key={event.id}
            onClick={() => setActiveEventId(event.id)}
            type="button"
          >
            <span className="event-swatch" style={{ backgroundColor: event.accent }} />
            <span>
              <strong>{event.name}</strong>
              <small>{formatDate(event.date)} - {event.venue}</small>
              <em>{soldPercent}% sold - {event.status}</em>
            </span>
          </button>
        );
      })}
      {events.length > 5 && (
        <button
          className="show-more-button"
          onClick={() => setShowAllEvents((currentValue) => !currentValue)}
          type="button"
        >
          {showAllEvents ? 'Show less' : `Show more (${hiddenCount})`}
        </button>
      )}
    </aside>
  );
}

export default EventSelector;
