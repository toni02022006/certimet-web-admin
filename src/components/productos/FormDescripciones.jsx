import React, { useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './FormDescripciones.css';

const FormDescripciones = ({ formData, handleQuillChange }) => {
  const quillRef = useRef(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  // Configuración del editor para todos los campos
  const modulos = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  };

  const generateQuillTableHTML = (rows, cols) => {
    let html = '<table width="100%" style="border-collapse: collapse; margin: 15px 0;">';
    html += '<tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        const isHeader = r === 0;
        const style = isHeader 
          ? 'border: 1px solid #000; padding: 10px; background-color: #f0f0f0; font-weight: bold; text-align: center;' 
          : 'border: 1px solid #000; padding: 10px; text-align: left;';
        
        const content = isHeader ? `Columna ${c + 1}` : `Dato ${r + 1}-${c + 1}`;
        html += `<td style="${style}">${content}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody>';
    html += '</table><p><br></p>'; 
    return html;
  };

  const generateTextTable = (rows, cols) => {
    let text = '\n';
    let header = '|';
    for (let c = 0; c < cols; c++) {
      header += ` Col ${c + 1} |`;
    }
    text += header + '\n';
    let separator = '|';
    for (let c = 0; c < cols; c++) {
      separator += '---|';
    }
    text += separator + '\n';
    for (let r = 1; r < rows; r++) {
      let row = '|';
      for (let c = 0; c < cols; c++) {
        row += ` Dato ${r + 1}-${c + 1} |`;
      }
      text += row + '\n';
    }
    return text + '\n';
  };

  const insertTableWithDelta = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      let range = quill.getSelection();
      
      if (!range) {
        const length = quill.getLength();
        quill.setSelection(length, 0);
        range = quill.getSelection();
      }

      if (range) {
        try {
          const tableHTML = generateQuillTableHTML(rows, cols);
          quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
          
          const content = quill.root.innerHTML;
          // Se envía especificando que es descripcion_tecnica
          handleQuillChange('descripcion_tecnica', content);
          setShowTableModal(false);
        } catch (error) {
          console.warn('Error al insertar tabla:', error);
          const textTable = generateTextTable(rows, cols);
          quill.insertText(range.index, textTable);
          handleQuillChange('descripcion_tecnica', quill.root.innerHTML);
          setShowTableModal(false);
        }
      } else {
        alert('Por favor, haz clic en el editor de la Descripción Técnica primero para posicionar el cursor.');
      }
    }
  };

  const handleInsertTableClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    insertTableWithDelta();
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTableModal(false);
  };

  const handleOpenModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTableModal(true);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowTableModal(false);
    }
  };

  return (
    <div className="form-descripciones-container">
      <h3>Descripciones del Equipo</h3>

      {/* 1. Descripción Corta */}
      <div className="descripcion-group">
        <label>1. Descripción Corta (Aparece junto al precio)</label>
        <div className="editor-container" style={{ marginBottom: '40px' }}>
          <ReactQuill
            theme="snow"
            value={formData.descripcion_corta || ''}
            onChange={(val) => handleQuillChange('descripcion_corta', val)}
            modules={modulos}
            placeholder="Ej: El USR-EG628 es un ordenador industrial de alto rendimiento..."
          />
        </div>
      </div>

      {/* 2. Descripción Detallada */}
      <div className="descripcion-group">
        <label>2. Descripción Detallada (Adicional)</label>
        <div className="editor-container" style={{ marginBottom: '40px' }}>
          <ReactQuill
            theme="snow"
            value={formData.descripcion_detallada || ''}
            onChange={(val) => handleQuillChange('descripcion_detallada', val)}
            modules={modulos}
            placeholder="Escribe los detalles adicionales del producto aquí..."
          />
        </div>
      </div>

      {/* 3. Descripción Técnica */}
      <div className="descripcion-group">
        <label>3. Descripción Técnica Detallada (Sobre este artículo y Especificaciones)</label>

        <div>
          <button
            type="button"
            className="btn-insertar-tabla"
            onClick={handleOpenModal}
          >
            📊 Insertar Tabla
          </button>
          <span className="info-ayuda" style={{ marginLeft: '10px' }}>
            Coloca el cursor en este editor y elige filas y columnas
          </span>
        </div>

        <div className="editor-container">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={formData.descripcion_tecnica || ''}
            onChange={(val) => handleQuillChange('descripcion_tecnica', val)}
            modules={modulos}
            placeholder="Escribe aquí las características, usa viñetas para 'Sobre este artículo' y crea tablas para las Especificaciones..."
          />
        </div>
      </div>

      {/* MODAL PARA CONFIGURAR LA TABLA */}
      {showTableModal && (
        <div className="table-modal-overlay" onClick={handleOverlayClick}>
          <div className="table-modal">
            <div className="table-modal-title">
              <span>📊</span> Insertar Tabla
            </div>
            <div className="table-modal-subtitle">
              Define el número de filas y columnas para tu tabla
            </div>
            
            <div className="table-modal-input-group">
              <div className="table-modal-input-item">
                <label>Filas</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="table-modal-input-item">
                <label>Columnas</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>

            {/* Vista previa de la tabla */}
            <div className="table-preview">
              <div className="table-preview-text">
                📐 Vista previa: <strong>{rows} filas</strong> × <strong>{cols} columnas</strong>
              </div>
              <div 
                className="table-preview-grid"
                style={{ gridTemplateColumns: `repeat(${Math.min(cols, 6)}, 1fr)` }}
              >
                {[...Array(Math.min(rows * cols, 36))].map((_, index) => {
                  const row = Math.floor(index / cols) + 1;
                  const col = index % cols + 1;
                  return (
                    <div key={index} className="table-preview-cell">
                      {row}×{col}
                    </div>
                  );
                })}
              </div>
              {rows * cols > 36 && (
                <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '11px', color: '#999' }}>
                  Mostrando 36 de {rows * cols} celdas
                </div>
              )}
            </div>

            <div className="table-modal-buttons">
              <button 
                type="button"
                className="btn-cancelar"
                onClick={handleCancelClick}
              >
                Cancelar
              </button>
              <button 
                type="button"
                className="btn-insertar"
                onClick={handleInsertTableClick}
              >
                ✅ Insertar Tabla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDescripciones;