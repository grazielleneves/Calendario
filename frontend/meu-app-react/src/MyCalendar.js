import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
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
  return { style };
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

  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); 
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const formattedEvents = response.data.map(event => ({
          ...event,
          start: new Date(event.hora_inicio),
          end: new Date(event.hora_termino),
          title: event.descricao 
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Falha ao buscar eventos.', error);
        if (error.response) {
          if (error.response.status === 401) {
            alert('Sessão expirada ou não autorizada. Por favor, faça login novamente.');
            handleLogout(); 
          } else {
            alert(`Erro do servidor ao buscar eventos: ${error.response.status} - ${error.response.data.message || 'Erro desconhecido'}`);
          }
        } else if (error.request) {
          alert('Não foi possível conectar ao servidor para buscar eventos. Verifique sua conexão.');
        } else {
          alert('Ocorreu um erro inesperado ao configurar a requisição de eventos.');
        }
      }
    };
    fetchEvents();
  }, [navigate]); 

  const handleSelectSlot = ({ start, end }) => {
    setCurrentEvent({ start, end, descricao: '', id: null }); 
    setShowModal(true); 
  };

  const handleSelect = (event) => {
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
      if (name === 'start' || name === 'end') {
        return { ...prev, [name]: new Date(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const checkOverlap = (newEventStart, newEventEnd, eventId = null) => {
    for (let i = 0; i < events.length; i++) {
      const existingEvent = events[i];
      if (eventId && existingEvent.id === eventId) {
        continue;
      }

      const existingStart = existingEvent.start;
      const existingEnd = existingEvent.end;

      if (
        (newEventStart < existingEnd && newEventEnd > existingStart)
      ) {
        return true; 
      }
    }
    return false; 
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    if (currentEvent.start >= currentEvent.end) {
        alert('A hora de início deve ser anterior à hora de término.');
        return; 
    }

    if (checkOverlap(currentEvent.start, currentEvent.end, currentEvent.id)) {
      alert('O evento se sobrepõe a um evento existente. Por favor, escolha um horário diferente.');
      return; 
    }

    const eventToSubmit = {
      descricao: currentEvent.descricao,
      hora_inicio: currentEvent.start.toISOString(),
      hora_termino: currentEvent.end.toISOString(),
    };

    const isEditing = currentEvent.id != null;

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/events/${currentEvent.id}`, eventToSubmit, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Evento atualizado com sucesso!'); 
      } else {
        await axios.post('http://localhost:5000/events', eventToSubmit, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Evento criado com sucesso!'); 
      }

      const res = await axios.get('http://localhost:5000/events', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const formattedEvents = res.data.map(event => ({
        ...event,
        start: new Date(event.hora_inicio),
        end: new Date(event.hora_termino),
        title: event.descricao
      }));

      setEvents(formattedEvents); 
      setShowModal(false); 
      setCurrentEvent(null); 
    } catch (error) {
      console.error('Erro ao salvar o evento:', error); 
      if (error.response) {
        if (error.response.status === 400) {
          alert(error.response.data.message || 'Existe um conflito de horário ou dados inválidos. Por favor, escolha um horário diferente.');
        } else if (error.response.status === 401) {
            alert('Sessão expirada ou não autorizada. Por favor, faça login novamente.');
            handleLogout(); 
        } else {
          alert(`Erro do servidor ao salvar evento: ${error.response.status} - ${error.response.data.message || 'Erro desconhecido.'}`);
        }
      } else if (error.request) {
        alert('Não foi possível conectar ao servidor para salvar o evento. Verifique sua conexão.');
      } else {
        alert('Ocorreu um erro inesperado ao salvar o evento. Por favor, tente novamente.');
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
      alert('Evento deletado com sucesso!'); 
    } catch (error) {
      console.error('Erro ao deletar o evento:', error); 
      if (error.response) {
        if (error.response.status === 401) {
          alert('Sessão expirada ou não autorizada. Por favor, faça login novamente.');
          handleLogout(); 

        } else {
          alert(`Erro do servidor ao deletar evento: ${error.response.status} - ${error.response.data.message || 'Erro desconhecido.'}`);
        }
      } else if (error.request) {
        alert('Não foi possível conectar ao servidor para deletar o evento. Verifique sua conexão.');
      } else {
        alert('Ocorreu um erro inesperado ao deletar o evento. Por favor, tente novamente.');
      }
    }
    handleCloseModal();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#e60000')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#ff4d4d')}
        >
          Sair
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={events.map(event => ({
          ...event,
          title: event.descricao
        }))}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelect}
        eventPropGetter={eventStyleGetter}
        components={components}
        style={{ height: '90vh' }}
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
              required 
            />
            <label htmlFor="start">Início:</label>
            <input
              type="datetime-local"
              name="start"
              value={(currentEvent.start instanceof Date) ? currentEvent.start.toISOString().slice(0, 16) : ''}
              onChange={handleEventChange}
              required 
            />
            <label htmlFor="end">Fim:</label>
            <input
              type="datetime-local"
              name="end"
              value={(currentEvent.end instanceof Date) ? currentEvent.end.toISOString().slice(0, 16) : ''}
              onChange={handleEventChange}
              required 
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