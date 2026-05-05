import { useCallback, useEffect, useRef, useState } from 'react';
import { qrCells } from '../data/mockData';

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function QRCheckinsPage({
  activeEvent,
  events = [],
  handleCheckIn,
  scanMessage,
  scanCode,
  setActiveEventId,
  setScanCode,
}) {
  const scanTimerRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraMessage, setCameraMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const today = getTodayIsoDate();
  const canScan = Boolean(activeEvent?.date) && activeEvent.date <= today;

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  useEffect(() => {
    stopCamera();
    setCameraMessage('');
  }, [activeEvent?.id, stopCamera]);

  async function startCameraScan() {
    if (!canScan) {
      return;
    }

    if (!('BarcodeDetector' in window)) {
      setCameraMessage('Camera QR scanning is not available in this browser. Enter the QR code manually.');
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setCameraMessage('Point the camera at the attendee QR code.');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      scanTimerRef.current = setInterval(async () => {
        if (!videoRef.current) {
          return;
        }

        const codes = await detector.detect(videoRef.current);
        const detectedCode = codes[0]?.rawValue;
        if (detectedCode) {
          setScanCode(detectedCode);
          setCameraMessage('QR code captured. Confirm check-in to mark attendance.');
          stopCamera();
        }
      }, 700);
    } catch (error) {
      setCameraMessage('Could not open the camera. Allow camera access or enter the QR code manually.');
      stopCamera();
    }
  }

  if (!events.length) {
    return (
      <section className="solo-page">
        <section className="data-card page-card empty-ticket">
          <div className="section-heading">
            <p>No events</p>
            <h2>Create an event first</h2>
          </div>
          <p className="small-note">QR check-ins will be available after tickets are booked.</p>
        </section>
      </section>
    );
  }

  return (
    <section className="page-grid tickets-layout qr-scan-layout">
      <section className="tool-panel qr-panel page-card">
        <div className="panel-title">
          <p>QR scan</p>
          <h3>{canScan ? `Scan ticket for ${activeEvent.name}` : 'Scanner opens on event date'}</h3>
        </div>
        {activeEvent.image && (
          <img className="booking-event-image" src={activeEvent.image} alt={activeEvent.name} />
        )}
        <div className="qr-code" aria-label="Sample QR ticket code">
          {qrCells.map((filled, index) => (
            <span className={filled ? 'filled' : ''} key={`${scanCode}-${index}`} />
          ))}
        </div>
        <div className={`qr-camera-frame ${isCameraOpen ? 'active' : ''}`}>
          <video ref={videoRef} muted playsInline aria-label="QR camera scanner" />
        </div>
        <div className="qr-camera-actions">
          <button disabled={!canScan || isCameraOpen} onClick={startCameraScan} type="button">
            Start camera
          </button>
          <button disabled={!isCameraOpen} onClick={stopCamera} type="button">
            Stop camera
          </button>
        </div>
        {cameraMessage && <p className="small-note">{cameraMessage}</p>}
        <input
          onChange={(event) => setScanCode(event.target.value)}
          value={scanCode}
          aria-label="Ticket code"
          disabled={!canScan}
          placeholder="Enter or scan attendee QR code"
        />
        <button
          className="wide-button checkin-button"
          disabled={!canScan}
          onClick={handleCheckIn}
          type="button"
        >
          Confirm check-in
        </button>
        {scanMessage && <p className="form-message qr-scan-message">{scanMessage}</p>}
        {canScan ? (
          <p className="small-note">
            {activeEvent.checkedIn} of {activeEvent.ticketsSold} booked guests are checked in.
          </p>
        ) : (
          <p className="qr-locked-note">
            {activeEvent.name} is scheduled for {activeEvent.date}. Scanning is locked until that date.
          </p>
        )}
      </section>
      <section className="data-card">
        <div className="section-heading">
          <p>Event scanner</p>
          <h2>Choose an event</h2>
        </div>
        <div className="qr-event-list">
          {events.map((event) => (
            <button
              className={event.id === activeEvent.id ? 'active' : ''}
              key={event.id}
              onClick={() => setActiveEventId(event.id)}
              type="button"
            >
              <span>
                <strong>{event.name}</strong>
                <small>{event.venue} | {event.date}</small>
              </span>
              <em>{event.date <= today ? 'Open' : 'Locked'}</em>
            </button>
          ))}
        </div>
        <div className="gate-list qr-gate-list">
          {activeEvent.gates.map((gate) => (
            <article key={gate.name}>
              <span>{gate.name}</span>
              <strong>{gate.count}</strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default QRCheckinsPage;
