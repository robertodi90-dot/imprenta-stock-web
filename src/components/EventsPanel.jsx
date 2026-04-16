const EVENT_VARIANT_CLASS = {
  entrada: 'entrada',
  salida: 'salida',
  ajuste: 'ajuste',
};

const normalizeType = (value = '') => String(value).trim().toLowerCase();

const EventsPanel = ({ events }) => (
  <aside className="panel events-panel">
    <h2>Eventos recientes</h2>
    <ul>
      {events.map((event, index) => {
        const variantClass = EVENT_VARIANT_CLASS[normalizeType(event.tipo)] ?? '';

        return (
          <li key={event.id ?? `${event.tipo}-${event.fecha}-${index}`} className={`event-item ${variantClass}`.trim()}>
            <p className="event-meta">
              <strong>{event.tipo}</strong> · {event.fecha}
            </p>
            <p>{event.texto}</p>
          </li>
        );
      })}
    </ul>
  </aside>
);

export default EventsPanel;
