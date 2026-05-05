import { qrCells } from '../data/mockData';
import { formatDate } from '../utils/formatters';

function TicketDetailsPage({ latestTicket, setPage }) {
  if (!latestTicket) {
    return (
      <section className="solo-page">
        <section className="data-card page-card empty-ticket">
          <div className="section-heading">
            <p>Ticket</p>
            <h2>No ticket booked yet</h2>
          </div>
          <p className="small-note">Book a ticket first, then the ticket pass will appear here.</p>
          <button className="wide-button" onClick={() => setPage('tickets')} type="button">
            Go to ticket booking
          </button>
        </section>
      </section>
    );
  }

  return (
    <section className="solo-page">
      <section className="ticket-pass page-card">
        <div className="ticket-main">
          <div>
            <p>Confirmed ticket</p>
            <h2>{latestTicket.eventName}</h2>
            <span>{formatDate(latestTicket.date)} at {latestTicket.venue}</span>
          </div>
          <div className="ticket-id">
            <span>Ticket ID</span>
            <strong>{latestTicket.id}</strong>
          </div>
        </div>

        <div className="ticket-grid">
          <article>
            <span>Attendee</span>
            <strong>{latestTicket.attendeeName}</strong>
          </article>
          <article>
            <span>Ticket type</span>
            <strong>{latestTicket.tierName}</strong>
          </article>
          <article>
            <span>Quantity</span>
            <strong>{latestTicket.tickets}</strong>
          </article>
          <article>
            <span>Total paid</span>
            <strong>Rs {latestTicket.amount.toLocaleString('en-IN')}</strong>
          </article>
        </div>

        <div className="ticket-qr-wrap">
          <div className="qr-code ticket-qr" aria-label="Ticket QR code">
            {qrCells.map((filled, index) => (
              <span className={filled ? 'filled' : ''} key={`${latestTicket.qrCode}-${index}`} />
            ))}
          </div>
          <div>
            <span>QR code</span>
            <strong>{latestTicket.qrCode}</strong>
            <p className="small-note">Show this pass at the venue check-in desk.</p>
          </div>
        </div>
      </section>
    </section>
  );
}

export default TicketDetailsPage;
