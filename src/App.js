import { useEffect, useMemo, useState } from 'react';
import './App.css';
import eventFlowLogo from './assets/ChatGPT Image Apr 30, 2026, 05_05_53 PM.png';
import { fallbackBookings, fallbackEvents } from './data/mockData';
import DashboardPage from './pages/DashboardPage';
import CreateEventsPage from './pages/CreateEventsPage';
import TicketBookingPage from './pages/TicketBookingPage';
import BookedTicketsPage from './pages/BookedTicketsPage';
import QRCheckinsPage from './pages/QRCheckinsPage';
import LiveCountsPage from './pages/LiveCountsPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import {
  bookTickets,
  checkInGuest,
  createEvent,
  deleteEvent,
  getEvents,
  getLiveCounts,
  loginUser,
  signupUser,
  updateEvent,
} from './services/api';
import { calculateTotals } from './utils/formatters';

const pages = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'create', label: 'Create Events' },
  { id: 'tickets', label: 'Ticket Booking' },
  { id: 'counts', label: 'Live Counts' },
];

const userPages = [
  { id: 'tickets', label: 'Ticket Booking' },
];

function AuthFormModal({
  accountRole,
  authError,
  authMode,
  eventFlowLogo,
  isSubmitting,
  onChooseMode,
  onChooseRole,
  onClose,
  onContinue,
}) {
  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = { ...Object.fromEntries(formData.entries()), role: accountRole };
    await onContinue(authMode, payload);
  }

  const roleLabel = accountRole === 'admin' ? 'Admin' : 'User';

  return (
    <section className="auth-modal-backdrop">
      <div className="auth-card">
        <button className="auth-close-button" onClick={onClose} type="button" aria-label="Close form">
          x
        </button>
        <img className="auth-form-logo" src={eventFlowLogo} alt="EventFlow" />
        <div className="section-heading">
          <p>{authMode === 'signup' ? `New ${roleLabel}` : `${roleLabel} access`}</p>
          <h2>{authMode === 'signup' ? `Create ${roleLabel.toLowerCase()} account` : `Login as ${roleLabel.toLowerCase()}`}</h2>
        </div>
        <div className="auth-role-tabs" role="tablist" aria-label="Account type">
          <button
            aria-selected={accountRole === 'admin'}
            className={accountRole === 'admin' ? 'active' : ''}
            onClick={() => onChooseRole('admin')}
            role="tab"
            type="button"
          >
            Admin
          </button>
          <button
            aria-selected={accountRole === 'user'}
            className={accountRole === 'user' ? 'active' : ''}
            onClick={() => onChooseRole('user')}
            role="tab"
            type="button"
          >
            User
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {authMode === 'signup' ? (
            accountRole === 'admin' ? (
              <>
                <div className="form-row">
                  <label>
                    First name
                    <input name="firstName" required placeholder="Enter first name" />
                  </label>
                  <label>
                    Last name
                    <input name="lastName" required placeholder="Enter last name" />
                  </label>
                </div>
                <label>
                  Email
                  <input name="email" required placeholder="admin@example.com" type="email" />
                </label>
                <div className="form-row">
                  <label>
                    Password
                    <input name="password" required placeholder="Create password" type="password" />
                  </label>
                  <label>
                    Confirm password
                    <input name="confirmPassword" required placeholder="Confirm password" type="password" />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Date of birth
                    <input name="dateOfBirth" required type="date" />
                  </label>
                  <label>
                    Mobile number
                    <input name="mobileNumber" required placeholder="+91 98765 43210" type="tel" />
                  </label>
                </div>
                {authError && <p className="auth-error">{authError}</p>}
                <button className="wide-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Creating account...' : 'Create admin account'}
                </button>
              </>
            ) : (
              <>
                <label>
                  Full name
                  <input name="firstName" required placeholder="Enter your name" />
                </label>
                <label>
                  Email
                  <input name="email" required placeholder="you@example.com" type="email" />
                </label>
                <label>
                  Mobile number
                  <input name="mobileNumber" required placeholder="+91 98765 43210" type="tel" />
                </label>
                <div className="form-row">
                  <label>
                    Password
                    <input name="password" required placeholder="Create password" type="password" />
                  </label>
                  <label>
                    Confirm password
                    <input name="confirmPassword" required placeholder="Confirm password" type="password" />
                  </label>
                </div>
                {authError && <p className="auth-error">{authError}</p>}
                <button className="wide-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Creating account...' : 'Create user account'}
                </button>
              </>
            )
          ) : (
            <>
              <label>
                Email
                <input name="email" required placeholder="you@example.com" type="email" />
              </label>
              <label>
                Password
                <input name="password" required placeholder="Enter password" type="password" />
              </label>
              {authError && <p className="auth-error">{authError}</p>}
              <button className="wide-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Logging in...' : `Login as ${roleLabel}`}
              </button>
            </>
          )}
        </form>
        <div className="auth-switch">
          {authMode === 'signup' ? (
            <button onClick={() => onChooseMode('login')} type="button">Already have an account? Login</button>
          ) : (
            <button onClick={() => onChooseMode('signup')} type="button">New user? Sign up</button>
          )}
        </div>
      </div>
    </section>
  );
}

function QRScanLoginModal({
  authError,
  eventFlowLogo,
  isSubmitting,
  onClose,
  onContinue,
}) {
  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onContinue({
      email: formData.get('username'),
      password: formData.get('password'),
      role: 'admin',
    });
  }

  return (
    <section className="auth-modal-backdrop">
      <div className="auth-card qr-login-card">
        <button className="auth-close-button" onClick={onClose} type="button" aria-label="Close QR login">
          x
        </button>
        <img className="auth-form-logo" src={eventFlowLogo} alt="EventFlow" />
        <div className="section-heading">
          <p>QR scan access</p>
          <h2>Login to open event scanner</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input name="username" required placeholder="Enter admin email" />
          </label>
          <label>
            Password
            <input name="password" required placeholder="Enter password" type="password" />
          </label>
          {authError && <p className="auth-error">{authError}</p>}
          <button className="wide-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Opening scanner...' : 'Login and scan'}
          </button>
        </form>
      </div>
    </section>
  );
}

function PublicQRScanPage({
  activeEvent,
  authError,
  eventFlowLogo,
  events,
  handleCheckIn,
  isSubmitting,
  onClose,
  onLogin,
  qrUser,
  scanCode,
  scanMessage,
  setActiveEventId,
  setScanCode,
}) {
  return (
    <main className="app-shell qr-public-shell">
      <section className="hero-panel qr-hero-panel">
        {activeEvent && <img className="hero-image" src={activeEvent.image} alt="" />}
        <div className="hero-overlay" />
        <nav className="topbar" aria-label="QR scan navigation">
          <button className="brand-mark" onClick={onClose} type="button">
            <img src={eventFlowLogo} alt="EventFlow" />
          </button>
          <div className="nav-actions">
            <button onClick={onClose} type="button">Home</button>
          </div>
        </nav>
        <div className="hero-content">
          <h1>QR Scan</h1>
        </div>
      </section>

      <section className="page-shell">
        {qrUser ? (
          <QRCheckinsPage
            activeEvent={activeEvent}
            events={events}
            handleCheckIn={handleCheckIn}
            scanCode={scanCode}
            scanMessage={scanMessage}
            setActiveEventId={setActiveEventId}
            setScanCode={setScanCode}
          />
        ) : (
          <section className="solo-page">
            <section className="data-card page-card empty-ticket">
              <div className="section-heading">
                <p>Protected scanner</p>
                <h2>Login required</h2>
              </div>
              <p className="small-note">Use an admin username and password to scan event tickets.</p>
            </section>
          </section>
        )}
      </section>

      {!qrUser && (
        <QRScanLoginModal
          authError={authError}
          eventFlowLogo={eventFlowLogo}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onContinue={onLogin}
        />
      )}
    </main>
  );
}

const homeImages = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=900&q=80',
];

function HomePage({
  accountRole,
  authError,
  authMode,
  eventFlowLogo,
  isAuthenticated = true,
  isSubmitting,
  onChooseMode,
  onChooseRole,
  onContinue,
  onOpenQrScan,
  setPage,
}) {
  const highlights = [
    ['Smart event creation', 'Build events with venues, dates, capacity, ticket tiers, and images from one polished workspace.'],
    ['Ticket booking', 'Book tickets quickly and keep every recent booking visible for smooth front-desk coordination.'],
    ['QR check-ins', 'Use ticket codes to mark guest arrivals and keep entry flow moving during busy moments.'],
    ['Live counts', 'Track sold, checked-in, remaining, and occupancy numbers while your event is running.'],
  ];

  return (
    <section className="home-page">
      {!isAuthenticated && (
        <header className="public-home-header">
          <button className="auth-brand" type="button">
            <img src={eventFlowLogo} alt="EventFlow" />
          </button>
          <div className="auth-header-actions">
            <button onClick={() => onChooseMode('login')} type="button">Login</button>
            <button onClick={() => onChooseMode('signup')} type="button">Sign up</button>
            <button onClick={onOpenQrScan} type="button">QR Scan</button>
          </div>
        </header>
      )}

      <header className="home-section home-intro">
        <div>
          <p>EventFlow platform</p>
          <h2>One elegant control room for premium events.</h2>
          <span>
            EventFlow connects event planning, ticket booking, QR entry, and live attendance
            into a single dashboard styled for modern event teams.
          </span>
          <button
            className="wide-button home-cta"
            onClick={() => (isAuthenticated ? setPage('dashboard') : onChooseMode('signup'))}
            type="button"
          >
            Open dashboard
          </button>
        </div>
        <img src={eventFlowLogo} alt="EventFlow logo" />
      </header>

      <section className="home-image-band">
        {homeImages.map((image) => (
          <img aria-hidden="true" key={image} src={image} alt="" />
        ))}
      </section>

      <section className="home-section home-feature-grid">
        {highlights.map(([title, text]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="home-section split-section image-split">
        <div>
          <p>For organizers</p>
          <h2>Create events with confidence</h2>
          <span>
            Add event details, upload a visual identity, define booking levels, and send the event
            directly into the live dashboard without jumping between tools.
          </span>
        </div>
        <img src={homeImages[0]} alt="Decorated event table" />
      </section>

      <section className="home-section split-section image-split">
        <img src={homeImages[1]} alt="Concert audience lights" />
        <div>
          <p>For guests</p>
          <h2>Simple booking and beautiful passes</h2>
          <span>
            Every booking becomes a clean ticket pass with event details, guest information,
            pricing, and a QR-style code area ready for check-in.
          </span>
        </div>
      </section>

      <section className="home-section stats-strip">
        <article><strong>01</strong><span>Create events</span></article>
        <article><strong>02</strong><span>Book tickets</span></article>
        <article><strong>03</strong><span>Scan entry</span></article>
        <article><strong>04</strong><span>Watch live counts</span></article>
      </section>

      <section className="home-section home-feature-grid">
        <article>
          <h3>Premium visual system</h3>
          <p>Warm rose-gold colors, soft panels, and ticket-inspired UI details match your brand logo.</p>
        </article>
        <article>
          <h3>Responsive pages</h3>
          <p>The dashboard, forms, cards, ticket pass, and check-in tools adapt for desktop and mobile screens.</p>
        </article>
        <article>
          <h3>Operational clarity</h3>
          <p>Search events, compare capacity, view schedules, and monitor recent bookings from one place.</p>
        </article>
        <article>
          <h3>Fast navigation</h3>
          <p>Move between dashboard, booking, QR check-ins, and live counts without losing context.</p>
        </article>
      </section>

      <footer className="home-footer">
        <img src={eventFlowLogo} alt="EventFlow" />
        <div>
          <strong>EventFlow</strong>
          <span>Exclusive access for beautifully managed events.</span>
        </div>
      </footer>

      {!isAuthenticated && authMode && (
        <AuthFormModal
          accountRole={accountRole}
          authError={authError}
          authMode={authMode}
          eventFlowLogo={eventFlowLogo}
          isSubmitting={isSubmitting}
          onChooseMode={onChooseMode}
          onChooseRole={onChooseRole}
          onClose={() => onChooseMode(null)}
          onContinue={onContinue}
        />
      )}
    </section>
  );
}

function getInitials(user) {
  const first = user?.firstName?.trim()?.[0] || '';
  const last = user?.lastName?.trim()?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'U';
}

function App() {
  const [page, setPage] = useState('dashboard');
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('eventflowUser')) || null;
    } catch (error) {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('eventflowUser')));
  const [authMode, setAuthMode] = useState(null);
  const [isQrScanOpen, setIsQrScanOpen] = useState(false);
  const [qrScanUser, setQrScanUser] = useState(null);
  const [accountRole, setAccountRole] = useState('admin');
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [events, setEvents] = useState(fallbackEvents);
  const [bookings, setBookings] = useState(fallbackBookings);
  const [activeEventId, setActiveEventId] = useState(null);
  const [ticketCount, setTicketCount] = useState(2);
  const [selectedTicketTier, setSelectedTicketTier] = useState('');
  const [latestTicket, setLatestTicket] = useState(null);
  const [bookedTickets, setBookedTickets] = useState([]);
  const [bookingName, setBookingName] = useState('');
  const [scanCode, setScanCode] = useState('EVT-26-1048');
  const [scanMessage, setScanMessage] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [createdEvent, setCreatedEvent] = useState({
    name: '',
    date: '',
    venue: '',
    capacity: '',
    price: '',
    image: '',
    levels: [
      { id: 1, name: 'VIP', price: '', capacity: '' },
      { id: 2, name: 'General', price: '', capacity: '' },
    ],
  });

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setEvents(data.events);
        setBookings(data.recentBookings);
        setActiveEventId((currentId) => currentId || data.events[0]?.id || null);
      } catch (error) {
        setEvents([]);
        setBookings([]);
      }
    }

    loadEvents();
  }, []);

  useEffect(() => {
    const activeEvent = events.find((event) => event.id === activeEventId) || events[0];
    if (!activeEvent?.tiers?.some((tier) => tier.name === selectedTicketTier)) {
      setSelectedTicketTier(activeEvent?.tiers[0]?.name || '');
    }
  }, [activeEventId, events, selectedTicketTier]);

  useEffect(() => {
    if (page !== 'counts') {
      return undefined;
    }

    const timer = setInterval(async () => {
      try {
        const data = await getLiveCounts();
        setEvents(data.events);
      } catch (error) {
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [page]);

  useEffect(() => {
    if (authUser?.role === 'user' && !['tickets', 'ticket', 'booked'].includes(page)) {
      setPage('tickets');
    }
  }, [authUser, page]);

  const activeEvent = events.find((event) => event.id === activeEventId) || events[0] || null;
  const totals = useMemo(() => calculateTotals(events), [events]);
  const occupancy = activeEvent ? Math.round((activeEvent.checkedIn / activeEvent.capacity) * 100) : 0;
  const soldPercent = activeEvent ? Math.round((activeEvent.ticketsSold / activeEvent.capacity) * 100) : 0;
  const remainingTickets = activeEvent ? Math.max(activeEvent.capacity - activeEvent.ticketsSold, 0) : 0;

  function getBlankEventForm() {
    return {
      name: '',
      date: '',
      venue: '',
      capacity: '',
      price: '',
      image: '',
      levels: [
        { id: 1, name: 'VIP', price: '', capacity: '' },
        { id: 2, name: 'General', price: '', capacity: '' },
      ],
    };
  }

  function resetEventForm() {
    setCreatedEvent(getBlankEventForm());
    setEditingEventId(null);
    setFormMessage('');
  }

  function handleEditEvent() {
    if (!activeEvent) {
      return;
    }

    setEditingEventId(activeEvent.id);
    setCreatedEvent({
      name: activeEvent.name,
      date: activeEvent.date,
      venue: activeEvent.venue,
      capacity: String(activeEvent.capacity),
      price: String(activeEvent.price),
      image: activeEvent.image,
      levels: activeEvent.tiers.map((tier) => ({
        id: tier.id,
        name: tier.name,
        price: String(tier.price),
        capacity: String(tier.capacity),
      })),
    });
    setFormMessage('');
    setPage('create');
  }

  async function handleDeleteEvent() {
    if (!activeEvent) {
      return;
    }

    const shouldDelete = window.confirm(`Delete "${activeEvent.name}" from the dashboard?`);
    if (!shouldDelete) {
      return;
    }

    try {
      const data = await deleteEvent(activeEvent.id);
      setEvents(data.events);
      setBookings(data.recentBookings || []);
      setActiveEventId(data.events[0]?.id || null);
      if (editingEventId === activeEvent.id) {
        resetEventForm();
      }
    } catch (error) {
      setFormMessage(error.message || 'Could not delete event.');
    }
  }

  function addBookingLevel() {
    setCreatedEvent((currentEvent) => ({
      ...currentEvent,
      levels: [
        ...currentEvent.levels,
        { id: Date.now(), name: '', price: '', capacity: '' },
      ],
    }));
  }

  function removeBookingLevel(index) {
    setCreatedEvent((currentEvent) => ({
      ...currentEvent,
      levels: currentEvent.levels.filter((level, levelIndex) => levelIndex !== index),
    }));
  }

  function updateBookingLevel(index, field, value) {
    setCreatedEvent((currentEvent) => ({
      ...currentEvent,
      levels: currentEvent.levels.map((level, levelIndex) =>
        levelIndex === index ? { ...level, [field]: value } : level,
      ),
    }));
  }

  async function handleCreateEvent(event) {
    event.preventDefault();
    setFormMessage('Publishing event...');

    try {
      const data = editingEventId
        ? await updateEvent(editingEventId, createdEvent)
        : await createEvent(createdEvent);
      setEvents(data.events);
      setActiveEventId(data.event.id);
      resetEventForm();
      setPage('dashboard');
      setFormMessage('');
    } catch (error) {
      setFormMessage(error.message || 'Could not save event. Check the backend server.');
    }
  }

  async function handleBooking(event) {
    event.preventDefault();
    setBookingError('');

    if (!activeEvent) {
      setBookingError('No active event selected for booking.');
      return;
    }

    try {
      const data = await bookTickets(activeEvent.id, {
        name: bookingName,
        tickets: Number(ticketCount),
        tierName: selectedTicketTier,
      });
      setEvents(data.events);
      setBookings(data.recentBookings);
      setLatestTicket(data.ticket);
      setBookedTickets((currentTickets) => [data.ticket, ...currentTickets]);
      setBookingName('');
      setPage('ticket');
    } catch (error) {
      console.error(error);
      setBookingError(error.message || 'Booking failed. Please try again.');
    }
  }

  async function handleCheckIn() {
    if (!activeEvent) {
      return;
    }

    try {
      const data = await checkInGuest(activeEvent.id, scanCode);
      setEvents(data.events);
      setScanCode(data.scanCode);
      setScanMessage('Ticket checked in successfully.');
    } catch (error) {
      setScanMessage(error.message || 'Could not check in this ticket.');
    }
  }

  const pageTitle = page === 'ticket'
    ? 'Ticket Pass'
    : page === 'booked'
      ? 'Booked Tickets'
    : [...pages, ...userPages].find((item) => item.id === page)?.label || 'Dashboard';
  const isUserAccount = authUser?.role === 'user';
  const visiblePages = isUserAccount ? userPages : pages;

  async function handleAuthContinue(mode, payload) {
    setAuthError('');
    setIsAuthSubmitting(true);

    try {
      const data = mode === 'signup'
        ? await signupUser(payload)
        : await loginUser(payload);

      localStorage.setItem('eventflowUser', JSON.stringify(data.user));
      setAuthUser(data.user);
      setIsAuthenticated(true);
      setAuthMode(null);
      setPage(data.user.role === 'user' ? 'tickets' : 'dashboard');
    } catch (error) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleQrLogin(payload) {
    setAuthError('');
    setIsAuthSubmitting(true);

    try {
      const data = await loginUser(payload);
      setQrScanUser(data.user);
    } catch (error) {
      setAuthError(error.message || 'QR scan login failed');
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  function closeQrScanPage() {
    setIsQrScanOpen(false);
    setQrScanUser(null);
    setAuthError('');
  }

  function handleLogout() {
    localStorage.removeItem('eventflowUser');
    setAuthUser(null);
    setIsAuthenticated(false);
    setAuthMode(null);
    setIsProfileOpen(false);
    setPage('dashboard');
  }

  if (!isAuthenticated && isQrScanOpen) {
    return (
      <PublicQRScanPage
        activeEvent={activeEvent}
        authError={authError}
        eventFlowLogo={eventFlowLogo}
        events={events}
        handleCheckIn={handleCheckIn}
        isSubmitting={isAuthSubmitting}
        onClose={closeQrScanPage}
        onLogin={handleQrLogin}
        qrUser={qrScanUser}
        scanCode={scanCode}
        scanMessage={scanMessage}
        setActiveEventId={setActiveEventId}
        setScanCode={setScanCode}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="public-home-shell">
        <HomePage
          authError={authError}
          authMode={authMode}
          accountRole={accountRole}
          eventFlowLogo={eventFlowLogo}
          isSubmitting={isAuthSubmitting}
          isAuthenticated={false}
          onChooseMode={(mode) => {
            setAuthError('');
            setAuthMode(mode);
          }}
          onChooseRole={(role) => {
            setAuthError('');
            setAccountRole(role);
          }}
          onContinue={handleAuthContinue}
          onOpenQrScan={() => {
            setAuthError('');
            setScanMessage('');
            setIsQrScanOpen(true);
          }}
          setPage={setPage}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        {activeEvent && <img className="hero-image" src={activeEvent.image} alt="" />}
        <div className="hero-overlay" />
        <nav className="topbar" aria-label="Main navigation">
          <button className="brand-mark" onClick={() => setPage('dashboard')} type="button">
            <img src={eventFlowLogo} alt="EventFlow" />
          </button>
          <div className="nav-actions">
            {visiblePages.map((item) => (
              <button
                className={page === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  setIsProfileOpen(false);
                }}
                type="button"
              >
                {item.label}
              </button>
            ))}
            <div className="profile-menu">
              <button
                className="profile-icon-button"
                onClick={() => setIsProfileOpen((isOpen) => !isOpen)}
                type="button"
                aria-expanded={isProfileOpen}
                aria-label="Open profile"
              >
                {getInitials(authUser)}
              </button>
              {isProfileOpen && (
                <section className="profile-panel" aria-label="Profile details">
                  <button
                    className="profile-close-button"
                    onClick={() => setIsProfileOpen(false)}
                    type="button"
                    aria-label="Close profile"
                  >
                    x
                  </button>
                  <div className="profile-panel-header">
                    <span>{getInitials(authUser)}</span>
                    <div>
                      <strong>{`${authUser?.firstName || 'EventFlow'} ${authUser?.lastName || 'User'}`.trim()}</strong>
                      <p>{isUserAccount ? 'User profile' : 'Organizer profile'}</p>
                    </div>
                  </div>
                  <div className="profile-detail-list">
                    <div>
                      <span>Email</span>
                      <strong>{authUser?.email || 'Not added'}</strong>
                    </div>
                    <div>
                      <span>Mobile</span>
                      <strong>{authUser?.mobileNumber || 'Not added'}</strong>
                    </div>
                    <div>
                      <span>Date of birth</span>
                      <strong>{authUser?.dateOfBirth || 'Not added'}</strong>
                    </div>
                  </div>
                  {isUserAccount && (
                    <button
                      className="profile-booked-button"
                      onClick={() => {
                        setPage('booked');
                        setIsProfileOpen(false);
                      }}
                      type="button"
                    >
                      Booked tickets
                    </button>
                  )}
                  <button className="profile-logout-button" onClick={handleLogout} type="button">
                    Logout
                  </button>
                </section>
              )}
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <h1>{pageTitle}</h1>
        </div>
      </section>

      <section className="page-shell">
        {page === 'dashboard' && (
          <DashboardPage
            activeEvent={activeEvent}
            bookings={bookings}
            events={events}
            occupancy={occupancy}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
            setActiveEventId={setActiveEventId}
            setPage={setPage}
            totals={totals}
          />
        )}

        {page === 'create' && (
          <CreateEventsPage
            addBookingLevel={addBookingLevel}
            createdEvent={createdEvent}
            formMessage={formMessage}
            handleCreateEvent={handleCreateEvent}
            isEditing={Boolean(editingEventId)}
            onCancelEdit={resetEventForm}
            removeBookingLevel={removeBookingLevel}
            setCreatedEvent={setCreatedEvent}
            updateBookingLevel={updateBookingLevel}
          />
        )}

        {page === 'tickets' && (
          <TicketBookingPage
            activeEvent={activeEvent}
            bookingName={bookingName}
            bookings={bookings}
            events={events}
            handleBooking={handleBooking}
            remainingTickets={remainingTickets}
            setActiveEventId={setActiveEventId}
            setBookingName={setBookingName}
            selectedTicketTier={selectedTicketTier}
            setSelectedTicketTier={setSelectedTicketTier}
            setTicketCount={setTicketCount}
            ticketCount={ticketCount}
            bookingError={bookingError}
          />
        )}

        {page === 'counts' && (
          <LiveCountsPage
            activeEvent={activeEvent}
            events={events}
            occupancy={occupancy}
            setActiveEventId={setActiveEventId}
            soldPercent={soldPercent}
          />
        )}

        {page === 'ticket' && (
          <TicketDetailsPage
            latestTicket={latestTicket}
            setPage={setPage}
          />
        )}

        {page === 'booked' && (
          <BookedTicketsPage
            bookedTickets={bookedTickets}
            setLatestTicket={setLatestTicket}
            setPage={setPage}
          />
        )}
      </section>
    </main>
  );
}

export default App;
