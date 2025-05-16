const EventModal = ({ event, onClose, onSubmit, onDelete }) => {
  const [descricao, setDescricao] = useState(event?.descricao || '');
  const [start, setStart] = useState(event?.start || new Date());
  const [end, setEnd] = useState(event?.end || new Date());

  return (
    <div className="modal">
      <form onSubmit={(e) => onSubmit(e, { ...event, descricao, start, end })}>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição do Evento"
        />
        <input
          type="datetime-local"
          value={start.toISOString().slice(0, 16)}
          onChange={(e) => setStart(new Date(e.target.value))}
        />
        <input
          type="datetime-local"
          value={end.toISOString().slice(0, 16)}
          onChange={(e) => setEnd(new Date(e.target.value))}
        />
        <button type="submit">Salvar</button>
        {event && event.id && (
          <button type="button" onClick={() => onDelete(event.id)}>Deletar</button>
        )}
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};
