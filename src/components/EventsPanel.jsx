import { useEffect, useState } from 'react';

const SESSION_STORAGE_KEY = 'showEventsPanel';

const getInitialShowEvents = () => {
  const persistedValue = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (persistedValue === null) return true;
  return persistedValue === 'true';
};

const EventsPanel = ({ events }) => {
  const [showEvents, setShowEvents] = useState(getInitialShowEvents);

  useEffect(() => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, String(showEvents));
  }, [showEvents]);

  return (
    <aside className="panel events-panel">
      <div className="events-header">
        <h2>Eventos recientes</h2>
        <button
          type="button"
          className="events-toggle-btn"
          onClick={() => setShowEvents((current) => !current)}
        >
          {showEvents ? 'Ocultar novedades' : 'Mostrar novedades'}
        </button>
      </div>

      {showEvents ? (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <p className="event-meta">
                <strong>{event.tipo}</strong> · {event.fecha}
              </p>
              <p>{event.detalle}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="events-collapsed-message">
          Novedades ocultas. Haz clic en “Mostrar novedades” para volver a verlas.
        </p>
      )}
    </aside>
  );
};

export default EventsPanel;
