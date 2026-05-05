function BookingFeed({ bookings }) {
  return (
    <section className="data-card">
      <div className="section-heading">
        <p>Sales desk</p>
        <h2>Recent bookings</h2>
      </div>
      <div className="booking-feed">
        {bookings.map((booking) => (
          <article key={`${booking.name}-${booking.time}-${booking.amount}`}>
            <div>
              <strong>{booking.name}</strong>
              <span>{booking.type} - {booking.time}</span>
            </div>
            <b>Rs {booking.amount.toLocaleString('en-IN')}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BookingFeed;
