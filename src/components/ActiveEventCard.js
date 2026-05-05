import { formatDate } from '../utils/formatters';

function ActiveEventCard({ activeEvent, occupancy, onDelete, onEdit }) {
  return (
    <section className="active-event-card">
      <div>
        <p>{activeEvent.category}</p>
        <h2>{activeEvent.name}</h2>
        <span>{formatDate(activeEvent.date)} at {activeEvent.venue}</span>
        <div className="mini-stats">
          <span>{activeEvent.rating} rating</span>
          <span>{activeEvent.vipGuests} VIP guests</span>
          <span>{activeEvent.waitlist} waitlist</span>
        </div>
        <div className="event-card-actions">
          <button onClick={onEdit} type="button">Edit</button>
          <button className="danger-button" onClick={onDelete} type="button">Delete</button>
        </div>
      </div>
      <div className="capacity-ring" style={{ '--progress': `${occupancy}%` }}>
        <strong>{occupancy}%</strong>
        <span>inside</span>
      </div>
    </section>
  );
}

export default ActiveEventCard;
