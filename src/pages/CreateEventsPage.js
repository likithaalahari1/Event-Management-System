function CreateEventsPage({
  addBookingLevel,
  createdEvent,
  formMessage,
  handleCreateEvent,
  isEditing,
  onCancelEdit,
  removeBookingLevel,
  setCreatedEvent,
  updateBookingLevel,
}) {
  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCreatedEvent({ ...createdEvent, image: reader.result });
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="solo-page">
      <form className="create-panel page-card" onSubmit={handleCreateEvent}>
        <div className="section-heading">
          <p>{isEditing ? 'Edit room' : 'Launch room'}</p>
          <h2>{isEditing ? 'Update event details' : 'Create a premium event'}</h2>
        </div>
        {formMessage && <p className="form-message">{formMessage}</p>}
        <label>
          Event name
          <input
            onChange={(event) => setCreatedEvent({ ...createdEvent, name: event.target.value })}
            placeholder="Luxury brand showcase"
            required
            value={createdEvent.name}
          />
        </label>
        <label>
          Date
          <input
            onChange={(event) => setCreatedEvent({ ...createdEvent, date: event.target.value })}
            required
            type="date"
            value={createdEvent.date}
          />
        </label>
        <label>
          Venue
          <input
            onChange={(event) => setCreatedEvent({ ...createdEvent, venue: event.target.value })}
            placeholder="Grand ballroom"
            required
            value={createdEvent.venue}
          />
        </label>
        <label>
          Event image
          <input
            accept="image/*"
            onChange={handleImageUpload}
            type="file"
          />
        </label>
        {createdEvent.image && (
          <img className="create-image-preview" src={createdEvent.image} alt="Event preview" />
        )}
        <div className="form-row">
          <label>
            Capacity
            <input
              min="1"
              onChange={(event) =>
                setCreatedEvent({ ...createdEvent, capacity: event.target.value })
              }
              required
              type="number"
              value={createdEvent.capacity}
            />
          </label>
          <label>
            Base price
            <input
              min="1"
              onChange={(event) => setCreatedEvent({ ...createdEvent, price: event.target.value })}
              required
              type="number"
              value={createdEvent.price}
            />
          </label>
        </div>
        <section className="booking-level-builder">
          <div className="section-heading compact-heading">
            <p>Booking levels</p>
            <h2>Ticket categories</h2>
          </div>
          {createdEvent.levels.map((level, index) => (
            <div className="level-row" key={level.id}>
              <label>
                Level name
                <input
                  onChange={(event) => updateBookingLevel(index, 'name', event.target.value)}
                  placeholder="VIP / Premium / General"
                  required
                  value={level.name}
                />
              </label>
              <label>
                Price
                <input
                  min="1"
                  onChange={(event) => updateBookingLevel(index, 'price', event.target.value)}
                  required
                  type="number"
                  value={level.price}
                />
              </label>
              <label>
                Seats
                <input
                  min="1"
                  onChange={(event) => updateBookingLevel(index, 'capacity', event.target.value)}
                  required
                  type="number"
                  value={level.capacity}
                />
              </label>
              <button
                className="remove-level-button"
                disabled={createdEvent.levels.length === 1}
                onClick={() => removeBookingLevel(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
          <button className="add-level-button" onClick={addBookingLevel} type="button">
            Add booking level
          </button>
        </section>
        <div className="creator-preview">
          <span>Saved setup</span>
          <strong>Your levels will appear in Ticket Booking</strong>
        </div>
        <div className="form-action-row">
          {isEditing && (
            <button className="secondary-button" onClick={onCancelEdit} type="button">
              Cancel edit
            </button>
          )}
          <button className="wide-button create-button" type="submit">
            {isEditing ? 'Save changes' : 'Publish event'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateEventsPage;
