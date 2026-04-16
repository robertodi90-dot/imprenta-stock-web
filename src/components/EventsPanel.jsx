const EventsPanel = ({ events }) => (
  <aside className="panel events-panel">
    <h2>Eventos recientes</h2>
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
  </aside>
);

export default EventsPanel;
