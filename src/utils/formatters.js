export function formatDate(date) {
  if (!date) {
    return '';
  }

  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

export function calculateTotals(events) {
  const summary = events.reduce(
    (total, event) => ({
      sold: total.sold + event.ticketsSold,
      checkedIn: total.checkedIn + event.checkedIn,
      capacity: total.capacity + event.capacity,
      revenue: total.revenue + event.ticketsSold * event.price,
      waitlist: total.waitlist + event.waitlist,
    }),
    { sold: 0, checkedIn: 0, capacity: 0, revenue: 0, waitlist: 0 },
  );

  return {
    ...summary,
    entryRate: summary.sold ? Math.round((summary.checkedIn / summary.sold) * 100) : 0,
  };
}
