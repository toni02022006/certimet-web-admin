import React, { useState } from 'react';
import ListaSuscriptores from '../components/marketing/ListaSuscriptores';
import RedactarCampana from '../components/marketing/RedactarCampana';
import Plantillas from '../components/marketing/Plantillas'; 
import '../components/marketing/Marketing.css'; 

const MarketingView = () => {
  // Estado de la pestaña activa
  const [activeTab, setActiveTab] = useState('lista'); 

  const [asunto, setAsunto] = useState('');
  const [contenidoHtml, setContenidoHtml] = useState('');

  const aplicarPlantilla = (data) => {
    setAsunto(data.asunto);
    setContenidoHtml(data.contenido);
    setActiveTab('campana');
  };

  return (
    <div className="marketing-container">
      <div className="marketing-header">
        <h1>Módulo de Marketing y Publicidad</h1>
      </div>

      <div className="marketing-tabs">
        <button 
          className={activeTab === 'lista' ? 'active' : ''} 
          onClick={() => setActiveTab('lista')}
        >
          Lista de Suscriptores
        </button>
        <button 
          className={activeTab === 'campana' ? 'active' : ''} 
          onClick={() => setActiveTab('campana')}
        >
          Redactar Campaña
        </button>
        {/*Agregamos el botón de Plantillas */}
        <button 
          className={activeTab === 'plantillas' ? 'active' : ''} 
          onClick={() => setActiveTab('plantillas')}
        >
          Plantillas
        </button>
      </div>

      <div className="marketing-content">
        {activeTab === 'lista' && <ListaSuscriptores />}
        
        {/*Le pasamos los props actualizados a RedactarCampana */}
        {activeTab === 'campana' && (
          <RedactarCampana 
            asunto={asunto} 
            setAsunto={setAsunto} 
            contenidoHtml={contenidoHtml} 
            setContenidoHtml={setContenidoHtml} 
          />
        )}

        {/*Le pasamos la función para usar la plantilla */}
        {activeTab === 'plantillas' && (
          <Plantillas onApplyTemplate={aplicarPlantilla} />
        )}
      </div>
    </div>
  );
};

export default MarketingView;