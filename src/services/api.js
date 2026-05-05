const API_BASE = 'http://127.0.0.1:8000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData.error || message;
    } catch (error) {
      message = `API request failed: ${response.status}`;
    }
    throw new Error(message);
  }

  return response.json();
}

export function getEvents() {
  return request('/events/');
}

export function signupUser(userData) {
  return request('/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function createEvent(eventData) {
  return request('/events/create/', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export function updateEvent(eventId, eventData) {
  return request(`/events/${eventId}/`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });
}

export function deleteEvent(eventId) {
  return request(`/events/${eventId}/`, {
    method: 'DELETE',
  });
}

export function bookTickets(eventId, bookingData) {
  return request(`/events/${eventId}/book/`, {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

export function checkInGuest(eventId, scanCode) {
  return request(`/events/${eventId}/checkin/`, {
    method: 'POST',
    body: JSON.stringify({ scanCode }),
  });
}

export function getLiveCounts() {
  return request('/live-counts/');
}
