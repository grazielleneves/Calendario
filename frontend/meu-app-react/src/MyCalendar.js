import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MyCalendar.css';

const eventStyleGetter = (event, start, end, isSelected) => {
  var style = {
    backgroundColor: '#3174ad',
    borderRadius: '5px',
    opacity: 0.8,
    color: 'white',
    border: '0px',
    display: 'block'
  };
  return {
    style: style
  };
};

const MyEvent = ({ event }) => (
  <span>
    <strong>{event.title}</strong>
  </span>
);

const components = {
  event: MyEvent
};

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    start: new Date(),
    end: new Date(),
    descricao: ''
  });

  // Função para buscar eventos do servidor
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const formattedEvents = response.data.map(event => ({
          ...event,
          start: new Date(event.hora_inicio),
          end: new Date(event.hora_termino)
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Falha ao buscar eventos.', error);
      }
    };
    fetchEvents();
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    // Abrir modal para criar um novo evento
    setCurrentEvent({ id: null, start, end, descricao: '' });
    setShowModal(true); 
  };
  const handleSelect = ( event ) => {
    // Abrir modal para editar um evento existente
    setCurrentEvent({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    });
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setCurrentEvent(null);
    setShowModal(false);
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent(prev => {
      // Se o campo alterado for 'start' ou 'end', converte para Date
      if (name === 'start' || name === 'end') {
        return { ...prev, [name]: new Date(value) };
      }
      // Para outros campos, apenas atualiza o valor
      return { ...prev, [name]: value };
    });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    const eventToSubmit = {
      descricao: currentEvent.descricao,
      hora_inicio: currentEvent.start.toISOString(),
      hora_termino: currentEvent.end.toISOString(),
    };
    try {
      const response = currentEvent.id
      ? await axios.put(`http://localhost:5000/events/${currentEvent.id}`, eventToSubmit, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      : await axios.post('http://localhost:5000/events', eventToSubmit, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    
      if (response.data) {
        // Atualize o estado dos eventos aqui com a resposta do servidor
        const newEvent = {
          ...response.data,
          start: new Date(response.data.hora_inicio || response.data.start),
          end: new Date(response.data.hora_termino || response.data.end),
        };
        if (currentEvent.id) {
          // Atualiza um evento existente
          setEvents(prevEvents => prevEvents.map(evt => evt.id === currentEvent.id ? newEvent : evt));
        } else {
          // Adiciona um novo evento
          setEvents(prevEvents => [...prevEvents, newEvent]);
        }
      } else {
      // Se não houver dados na resposta, significa que algo deu errado
        console.error('Nenhum dado foi retornado pelo servidor');
      }
      setShowModal(false);
      setCurrentEvent(null); 
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('Existe um conflito de horário com outro evento. Por favor, escolha um horário diferente.');
      } else {
        console.error('Erro ao salvar o evento:', error.response ? error.response.data : error.message);
      }
    }
    handleCloseModal();
  };

  const handleEventDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/events/${currentEvent.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowModal(false);
      setEvents(prevEvents => prevEvents.filter(evt => evt.id !== currentEvent.id));
    } catch (error) {
      console.error(error);
    }
    handleCloseModal();
  };
  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events.map(event =>{
          console.log(event);
          return{
            ...event,
            title: event.descricao,
            start: new Date(event.start),
            end: new Date(event.end),
          };
        })}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelect}
        eventPropGetter={eventStyleGetter}
        components={components}
        style={{ height: '100vh' }}
      />
      {showModal && (
        <div className="modal">
          <form onSubmit={handleEventSubmit}>
            <label htmlFor="descricao">Descrição:</label>
            <input
              type="text"
              name="descricao"
              value={currentEvent.descricao || ''}
              onChange={handleEventChange}
            />
            <label htmlFor="start">Início:</label>
            <input
              type="datetime-local"
              name="start"
              value={(currentEvent.start instanceof Date) ? currentEvent.start.toISOString().slice(0, 16) : ''}
              onChange={handleEventChange}
            />
            <label htmlFor="end">Fim:</label>
            <input
              type="datetime-local"
              name="end"
              value={(currentEvent.end instanceof Date) ? currentEvent.end.toISOString().slice(0, 16) : ''}
              onChange={handleEventChange}
            />
            <button type="submit">Salvar</button>
            {currentEvent.id && (
              <button type="button" onClick={handleEventDelete}>Deletar</button>
            )}
            <button type="button" onClick={handleCloseModal}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
