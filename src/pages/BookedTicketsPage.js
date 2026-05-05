import { formatDate } from '../utils/formatters';

function BookedTicketsPage({ bookedTickets, setLatestTicket, setPage }) {
  if (!bookedTickets.length) {
    return (
      <section className="solo-page">
        <section className="data-card page-card empty-ticket">
          <div className="section-heading">
            <p>Booked tickets</p>
            <h2>No bookings yet</h2>
          </div>
          <p className="small-note">Your booked tickets will appear here after checkout.</p>
          <button className="wide-button" onClick={() => setPage('tickets')} type="button">
            Browse events
          </button>
        </section>
      </section>
    );
  }

  return (
    <section className="page-main">
      <div className="section-heading">
        <p>Booked tickets</p>
        <h2>Your events</h2>
      </div>
      <section className="booked-ticket-grid">
        {bookedTickets.map((ticket) => (
          <article className="booked-ticket-card" key={ticket.id}>
            <div>
              <span>{formatDate(ticket.date)} - {ticket.venue}</span>
              <h3>{ticket.eventName}</h3>
            </div>
            <div className="booked-ticket-meta">
              <span>{ticket.tierName}</span>
              <strong>{ticket.tickets} ticket{ticket.tickets === 1 ? '' : 's'}</strong>
            </div>
            <div className="booked-ticket-meta">
              <span>Attendee</span>
              <strong>{ticket.attendeeName}</strong>
            </div>
            <div className="booked-ticket-meta">
              <span>Amount</span>
              <strong>Rs {ticket.amount.toLocaleString('en-IN')}</strong>
            </div>
            <button
              className="wide-button"
              onClick={() => {
                setLatestTicket(ticket);
                setPage('ticket');
              }}
              type="button"
            >
              View pass
            </button>
          </article>
        ))}
      </section>
    </section>
  );
}

export default BookedTicketsPage;
