import { useEffect, useState } from 'react';

const STORAGE_KEY = 'imprenta-stock-events-visible';

const EventsPanel = ({ events }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const savedValue = sessionStorage.getItem(STORAGE_KEY);
    if (savedValue !== null) {
      setIsVisible(savedValue === 'true');
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, String(isVisible));
  }, [isVisible]);

  return (
    <aside className="panel events-panel">
      <div className="events-header">
        <h2>Novedades recientes</h2>
        <button
          type="button"
          className="clear-btn"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? 'Ocultar novedades' : 'Mostrar novedades'}
        </button>
      </div>

      {isVisible && (
        <ul>
          {events.map((event, index) => (
            <li key={event.id ?? `${event.tipo}-${event.fecha}-${index}`}>
              <p className="event-meta">
                <strong>{event.tipo}</strong> · {event.fecha}
              </p>
              <p>{event.texto ?? event.detalle}</p>
            </li>
          ))}
        </ul>
      )}

      {!isVisible && <p className="empty-state">Novedades ocultas para esta sesión.</p>}
    </aside>
  );
};

export default EventsPanel;
