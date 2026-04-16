const EventsPanel = ({ events }) => (
  <aside className="panel events-panel">
    <h2>Eventos recientes</h2>
    <ul>
      {events.map((event, index) => (
        <li key={event.id ?? `${event.tipo}-${event.fecha}-${index}`}>
          <p className="event-meta">
            <strong>{event.tipo}</strong> · {event.fecha}
          </p>
          <p>{event.texto}</p>
        </li>
      ))}
    </ul>
  </aside>
);

export default EventsPanel;
