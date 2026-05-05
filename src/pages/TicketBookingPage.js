import { useState } from 'react';
import BookingFeed from '../components/BookingFeed';
import TierBreakdown from '../components/TierBreakdown';
import { formatDate } from '../utils/formatters';

function TicketBookingPage({
  activeEvent,
  bookingName,
  bookings,
  events,
  handleBooking,
  setActiveEventId,
  setBookingName,
  selectedTicketTier,
  setTicketCount,
  setSelectedTicketTier,
  ticketCount,
}) {
  const [selectedPass, setSelectedPass] = useState(null);
  const [wishlistedEvents, setWishlistedEvents] = useState([]);

  if (!events.length) {
    return (
      <section className="solo-page">
        <section className="data-card page-card empty-ticket">
          <div className="section-heading">
            <p>No events</p>
            <h2>Create an event first</h2>
          </div>
          <p className="small-note">Ticket booking cards appear here after you create an event.</p>
        </section>
      </section>
    );
  }

  function openBooking(event, tierName = event.tiers[0]?.name || '') {
    setSelectedPass({ eventId: event.id });
    setActiveEventId(event.id);
    setSelectedTicketTier(tierName);
    setTicketCount(1);
  }

  async function handleShare() {
    const shareText = `${bookingEvent.name} at ${bookingEvent.venue} on ${formatDate(bookingEvent.date)}`;

    if (navigator.share) {
      await navigator.share({ title: bookingEvent.name, text: shareText, url: window.location.href });
      return;
    }

    await navigator.clipboard?.writeText(`${shareText} - ${window.location.href}`);
    window.alert('Event link copied to clipboard.');
  }

  function toggleWishlist() {
    setWishlistedEvents((currentEvents) =>
      currentEvents.includes(bookingEvent.id)
        ? currentEvents.filter((eventId) => eventId !== bookingEvent.id)
        : [...currentEvents, bookingEvent.id],
    );
  }

  const bookingEvent =
    events.find((event) => event.id === selectedPass?.eventId) || activeEvent || events[0];
  const currentTier =
    bookingEvent.tiers.find((tier) => tier.name === selectedTicketTier) || bookingEvent.tiers[0];
  const ticketPrice = currentTier?.price || bookingEvent.price;
  const tierRemaining = currentTier ? Math.max(currentTier.capacity - currentTier.sold, 0) : 0;

  if (!selectedPass) {
    return (
      <section className="page-main">
        <div className="section-heading">
          <p>Ticket booking</p>
          <h2>Choose an event</h2>
        </div>
        <section className="booking-card-grid">
          {events.map((event) => {
            const remaining = Math.max(event.capacity - event.ticketsSold, 0);
            const startingPrice = Math.min(...event.tiers.map((tier) => tier.price));

            return (
              <article className="booking-card" key={event.id}>
                <img src={event.image} alt={event.name} />
                <div className="booking-card-body">
                  <span>{formatDate(event.date)} - {event.venue}</span>
                  <h3>{event.name}</h3>
                  <div className="booking-card-meta">
                    <strong>{event.tiers.length} categories</strong>
                    <b>From Rs {startingPrice.toLocaleString('en-IN')}</b>
                  </div>
                  <p>{remaining} passes left</p>
                  <button
                    className="wide-button"
                    disabled={remaining === 0}
                    onClick={() => openBooking(event)}
                    type="button"
                  >
                    {remaining === 0 ? 'Sold out' : 'Open event'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </section>
    );
  }

  return (
    <section className="page-grid tickets-layout">
      <section className="tool-panel page-card">
        <img className="booking-event-image" src={bookingEvent.image} alt={bookingEvent.name} />
        <div className="panel-title">
          <p>{formatDate(bookingEvent.date)} - {bookingEvent.venue}</p>
          <h3>{bookingEvent.name}</h3>
        </div>
        <div className="booking-category-list">
          {bookingEvent.tiers.map((tier) => {
            const remaining = Math.max(tier.capacity - tier.sold, 0);
            const isSelected = currentTier?.name === tier.name;

            return (
              <button
                className={isSelected ? 'active' : ''}
                disabled={remaining === 0}
                key={tier.name}
                onClick={() => {
                  setSelectedTicketTier(tier.name);
                  setTicketCount(1);
                }}
                type="button"
              >
                <span>{tier.name}</span>
                <strong>Rs {tier.price.toLocaleString('en-IN')}</strong>
                <small>{remaining} left</small>
              </button>
            );
          })}
        </div>
        <TierBreakdown activeEvent={bookingEvent} />
      </section>
      <form className="tool-panel page-card" onSubmit={handleBooking}>
        <div className="panel-title">
          <p>Ticket booking</p>
          <h3>Book {currentTier?.name} for {bookingEvent.name}</h3>
        </div>
        <button className="back-link-button" onClick={() => setSelectedPass(null)} type="button">
          Back to passes
        </button>
        <div className="ticket-summary">
          <span>Selected pass</span>
          <strong>{currentTier?.name || 'General'} - Rs {ticketPrice.toLocaleString('en-IN')}</strong>
        </div>
        <label>
          Attendee name
          <input
            onChange={(event) => setBookingName(event.target.value)}
            placeholder="Enter attendee name"
            value={bookingName}
          />
        </label>
        <label>
          Tickets
          <input
            min="1"
            max={Math.max(tierRemaining, 1)}
            onChange={(event) => setTicketCount(event.target.value)}
            type="number"
            value={ticketCount}
          />
        </label>
        <button className={`wide-button ${currentTier ? 'selected-book-button' : ''}`} disabled={tierRemaining === 0} type="submit">
          Book Rs {(Number(ticketCount || 0) * ticketPrice).toLocaleString('en-IN')}
        </button>
        <div className="booking-side-actions">
          <button onClick={handleShare} type="button">Share</button>
          <button className={wishlistedEvents.includes(bookingEvent.id) ? 'active' : ''} onClick={toggleWishlist} type="button">
            {wishlistedEvents.includes(bookingEvent.id) ? 'Wishlisted' : 'Wishlist'}
          </button>
        </div>
        <p className="small-note">{tierRemaining} {currentTier?.name} passes remaining</p>
        <BookingFeed bookings={bookings} />
      </form>
    </section>
  );
}

export default TicketBookingPage;
