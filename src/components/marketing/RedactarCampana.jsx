import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import './RedactarCampana.css';

// Definimos la URL base para producción (Compatible con Vite)
const API_URL = import.meta.env.VITE_API_URL;

const RedactarCampana = ({
  asunto,
  setAsunto,
  contenidoHtml,
  setContenidoHtml,
}) => {
  const [filtroEtiqueta, setFiltroEtiqueta] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });
  const [progress, setProgress] = useState(0);
  const [totalSubs, setTotalSubs] = useState(0);
  const [fondoColor, setFondoColor] = useState('#ffffff');
  const [suscriptoresCount, setSuscriptoresCount] = useState(0);

  const previewRef = useRef(null);

  // Socket para progreso
  useEffect(() => {
    // Usamos la URL dinámica en lugar de localhost
    const socket = io(API_URL);
    socket.on('newsletter_progress', (data) => {
      setTotalSubs(data.total);
      setProgress(data.sent);
    });
    return () => socket.disconnect();
  }, []);

  // Obtener cantidad de suscriptores (para mostrarla en la confirmación)
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_URL}/api/newsletter/suscriptores/count`);
        if (res.ok) {
          const data = await res.json();
          setSuscriptoresCount(data.total || 0);
        }
      } catch (error) {
        console.error('Error al obtener conteo de suscriptores:', error);
      }
    };
    fetchCount();
  }, []);

  // Sincronizar contenidoHtml → preview
  useEffect(() => {
    if (previewRef.current && previewRef.current.innerHTML !== contenidoHtml) {
      previewRef.current.innerHTML = contenidoHtml;
      const firstDiv = previewRef.current.querySelector('div');
      if (firstDiv && firstDiv.style.backgroundColor) {
        setFondoColor(firstDiv.style.backgroundColor);
      } else if (firstDiv && firstDiv.style.background) {
        setFondoColor(firstDiv.style.background);
      }
    }
  }, [contenidoHtml]);

  // Sincronizar preview → contenidoHtml
  const handlePreviewInput = () => {
    if (previewRef.current) {
      setContenidoHtml(previewRef.current.innerHTML);
    }
  };

  // --- Funciones de formato ---
  const applyStyleToSelection = (styleName, value) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const selectedContent = range.extractContents();
    const span = document.createElement('span');
    span.style[styleName] = value;
    span.appendChild(selectedContent);
    range.insertNode(span);

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    if (previewRef.current) {
      setContenidoHtml(previewRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (previewRef.current) {
      setContenidoHtml(previewRef.current.innerHTML);
    }
  };

  const handleColorChange = (e) => {
    applyStyleToSelection('color', e.target.value);
  };

  const handleBackColorChange = (e) => {
    applyStyleToSelection('backgroundColor', e.target.value);
  };

  const handleFontSize = (e) => {
    applyStyleToSelection('fontSize', e.target.value + 'px');
  };

  const handleLink = () => {
    const url = prompt('Ingresa la URL del enlace:', 'https://');
    if (url) {
      const selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) {
        Swal.fire('Aviso', 'Selecciona el texto que quieras convertir en enlace.', 'info');
        return;
      }
      execCommand('createLink', url);
    }
  };

  const clearFormat = () => {
    execCommand('removeFormat');
  };

  // --- CAMBIO DE FONDO DEL CORREO ---
  const handleFondoChange = (e) => {
    const color = e.target.value;
    setFondoColor(color);
    const preview = previewRef.current;
    if (!preview) return;

    const firstChild = preview.firstElementChild;
    if (firstChild && firstChild.tagName === 'DIV') {
      firstChild.style.backgroundColor = color;
      if (!firstChild.style.padding) firstChild.style.padding = '20px';
      if (!firstChild.style.borderRadius) firstChild.style.borderRadius = '6px';
    } else {
      const contenido = preview.innerHTML;
      const nuevoHtml = `
        <div style="background-color: ${color}; padding: 20px; border-radius: 6px; max-width: 600px; margin: 0 auto;">
          ${contenido}
        </div>
      `;
      preview.innerHTML = nuevoHtml;
    }
    setContenidoHtml(preview.innerHTML);
  };

  // --- Plantillas ---
  const cargarPlantillaBoletin = () => {
    setAsunto('Novedades y Actualizaciones del Sector - CERTIMET');
    setContenidoHtml(`
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #0056b3; padding: 30px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Boletín Informativo</h1>
  </div>
  <div style="padding: 30px 20px; background-color: #ffffff;">
    <h2 style="color: #0056b3; font-size: 20px; margin-top: 0;">¡Hola!</h2>
    <p style="line-height: 1.6; color: #475569;">Te compartimos las últimas noticias sobre metrología y calibración. Nuestro equipo ha estado trabajando para traerte las mejores actualizaciones normativas e innovaciones tecnológicas del sector industrial.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://certimet.pe/blog" style="display: inline-block; background-color: #0056b3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Leer nuestro Blog</a>
    </div>
    <p style="line-height: 1.6; color: #475569;">Atentamente,<br><strong>Juan Anthoni y el equipo de Certimet</strong></p>
  </div>
  <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
    © 2026 Certimet. Todos los derechos reservados.
  </div>
</div>
    `.trim());
  };

  const cargarPlantillaPromocion = () => {
    setAsunto('¡20% de Descuento en tu próxima Calibración!');
    setContenidoHtml(`
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; border: 2px dashed #0056b3; border-radius: 8px; background-color: #f0f9ff;">
  <div style="padding: 40px 20px; text-align: center;">
    <h1 style="color: #0369a1; margin: 0 0 10px 0; font-size: 28px;">¡Oferta Exclusiva!</h1>
    <p style="font-size: 16px; color: #0284c7; margin-bottom: 30px;">Asegura la precisión de tus equipos con nosotros.</p>
    <div style="background-color: white; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase;">Código de Descuento</p>
      <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: 2px;">CALIBRA20</p>
    </div>
    <p style="margin-top: 30px; font-size: 14px; color: #475569;">*Válido para servicios programados hasta fin de mes. Muestra este correo a tu asesor.</p>
  </div>
</div>
    `.trim());
  };

  const cargarPlantillaWebinar = () => {
    setAsunto('Invitación a Webinar: Metrología 4.0');
    setContenidoHtml(`
<div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #aeeef3;">
  <div style="background: #0a1e3c; padding: 35px 30px 25px; text-align: center; position: relative;">
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #c9a84c, #f5e1a0, #c9a84c);"></div>
    <div style="display: inline-block; background: rgba(255,255,255,0.06); padding: 6px 20px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #b8c9e8;">Webinar Exclusivo</div>
    <div style="margin: 18px 0 6px; font-size: 30px; font-weight: 700; letter-spacing: -0.5px; color: white;">Metrología 4.0</div>
    <p style="color: #aec2e6; font-size: 18px; margin: 0; font-weight: 300; font-style: italic;">Tendencias, Innovación y Futuro</p>
    <div style="margin-top: 12px; color: #d4e0f0; font-size: 14px;">JUEVES 20 DE AGOSTO - 11:00 AM</div>
  </div>
  <div style="padding: 30px 25px; background: #ffffff;">
    <h2 style="color: #0a1e3c; font-size: 20px; margin-top: 0;">Estimado suscriptor,</h2>
    <p style="line-height: 1.6; color: #334155;">Nos complace invitarle al <strong>Webinar Metrología 4.0</strong>, un espacio donde exploraremos las tendencias que están transformando el sector de la calibración y la certificación.</p>
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 8px; color: #0a1e3c; font-size: 16px;">Lo que aprenderás:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #334155;">
        <li>Nuevas normas ISO para la industria 4.0</li>
        <li>Digitalización de procesos de calibración</li>
        <li>Casos de éxito en automatización de laboratorios</li>
      </ul>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0;">
      <div style="flex: 1; min-width: 120px; background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 12px; color: #64748b;">DURACIÓN</div>
        <div style="font-weight: 600; color: #0a1e3c;">90 minutos</div>
      </div>
      <div style="flex: 1; min-width: 120px; background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 12px; color: #64748b;">PONENTES</div>
        <div style="font-weight: 600; color: #0a1e3c;">Dr. Carlos Rivas & Ing. Sofía Méndez</div>
      </div>
    </div>
    <div style="text-align: center; margin: 30px 0 20px;">
      <a href="https://certimet.pe/webinar" style="display: inline-block; background-color: #c9a84c; color: #0a1e3c; padding: 14px 35px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px;">INSCRIBIRSE AHORA</a>
      <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Cupos limitados · Certificado de participación</p>
    </div>
  </div>
  <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
    ¿Preguntas? Contáctenos en <a href="mailto:eventos@certimet.pe" style="color: #0a1e3c;">eventos@certimet.pe</a>
  </div>
</div>
    `.trim());
  };

  // --- Envío con confirmación ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos
    if (!asunto || !contenidoHtml) {
      setAlerta({ tipo: 'error', mensaje: 'Debes llenar el asunto y el contenido del correo.' });
      return;
    }

    // Mostrar confirmación con SweetAlert2
    const result = await Swal.fire({
      title: '⚠️ ¿Estás seguro?',
      html: `
        <div style="text-align: left;">
          <p style="font-size: 16px;"><strong>Estás a punto de enviar un correo masivo</strong></p>
          <ul style="font-size: 15px; margin: 10px 0;">
            <li><strong>Asunto:</strong> "${asunto}"</li>
            <li><strong>Segmento:</strong> ${filtroEtiqueta === 'todos' ? 'Todos los suscriptores' : filtroEtiqueta}</li>
          </ul>
          <p style="color: #d33; font-weight: bold; margin-top: 10px;">
            ⚠️ Esta acción es <strong>irreversible</strong> y no se puede deshacer.
          </p>
          <p style="font-size: 14px; color: #64748b;">
            ¿Deseas continuar?
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, enviar correo',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 500,
    });

    if (!result.isConfirmed) {
      // Si cancela, no hacemos nada
      return;
    }

    // Si confirma, procedemos con el envío
    setAlerta({ tipo: '', mensaje: '' });
    setProgress(0);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/newsletter/campana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asunto, contenidoHtml, filtroEtiqueta }),
      });
      const data = await response.json();

      if (response.ok) {
        // Mostrar éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Envío iniciado!',
          text: 'El correo masivo se está enviando. Recibirás una notificación al finalizar.',
          timer: 4000,
          showConfirmButton: false,
        });
        setAlerta({ tipo: 'success', mensaje: data.message });
        setAsunto('');
        setContenidoHtml('');
        setFiltroEtiqueta('todos');
        setProgress(0);
      } else {
        Swal.fire('Error', data.error || 'Ocurrió un error al enviar.', 'error');
        setAlerta({ tipo: 'error', mensaje: data.error || 'Ocurrió un error.' });
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
      setAlerta({ tipo: 'error', mensaje: 'Error al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const porcentajeProgreso = totalSubs > 0 ? Math.round((progress / totalSubs) * 100) : 0;

  return (
    <div className="redactar-campana-wrapper">
      <div className="campana-form-section">
        <div className="campana-form-header">
          <h2>Configuración de la Campaña</h2>
          <div className="plantillas-botones">
            <button type="button" onClick={cargarPlantillaBoletin} className="btn-plantilla">Boletín</button>
            <button type="button" onClick={cargarPlantillaPromocion} className="btn-plantilla">Promoción</button>
            <button type="button" onClick={cargarPlantillaWebinar} className="btn-plantilla">Webinar</button>
          </div>
        </div>

        {alerta.mensaje && <div className={`alert ${alerta.tipo}`}>{alerta.mensaje}</div>}

        <form onSubmit={handleSubmit} className="campana-form-body">
          <div className="form-group">
            <label>Enviar a:</label>
            <select className="form-select" value={filtroEtiqueta} onChange={(e) => setFiltroEtiqueta(e.target.value)}>
              <option value="todos">Todos los suscriptores activos</option>
              <option value="general_web">Suscriptores Web General</option>
              <option value="seccion_nosotros">Suscriptores de 'Nosotros'</option>
              <option value="seccion_tienda">Suscriptores de 'Tienda'</option>
            </select>
          </div>

          <div className="form-group">
            <label>Asunto del Correo:</label>
            <input type="text" className="form-input" placeholder="Ej: ¡Nuevos servicios en Certimet!" value={asunto} onChange={(e) => setAsunto(e.target.value)} />
          </div>

          <div className="form-group flex-grow">
            <label>Contenido (HTML puro):</label>
            <textarea className="form-textarea codigo-fuente" placeholder="Escribe o pega tu código HTML aquí..." value={contenidoHtml} onChange={(e) => setContenidoHtml(e.target.value)} />
            <small style={{ color: '#64748b', marginTop: '5px' }}>También puedes editar directamente en la vista previa con las herramientas visuales.</small>
          </div>

          {loading && totalSubs > 0 && (
            <div className="progress-container" style={{ margin: '15px 0', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#0056b3' }}>Enviando... ({progress} de {totalSubs})</span>
                <span style={{ color: '#475569' }}>{porcentajeProgreso}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '50px', height: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${porcentajeProgreso}%`, backgroundColor: '#0056b3', height: '100%', transition: 'width 0.5s ease' }}></div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px', fontStyle: 'italic' }}>(No cierres esta ventana. Esto tomará unos minutos para no saturar a Google)</p>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? '⏳ Enviando...' : 'Enviar Correo Masivo'}
          </button>
        </form>
      </div>

      <div className="campana-preview-section">
        <h2>Vista Previa del Correo <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748b' }}>(Editable)</span></h2>
        <div className="preview-container">
          <div className="preview-header">
            <p><strong>De:</strong> no-reply@certimet.pe</p>
            <p><strong>Asunto:</strong> {asunto || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin asunto</span>}</p>
          </div>

          <div className="editor-toolbar">
            <button onClick={() => execCommand('bold')} title="Negrita"><b>B</b></button>
            <button onClick={() => execCommand('italic')} title="Cursiva"><i>I</i></button>
            <button onClick={() => execCommand('underline')} title="Subrayado"><u>U</u></button>
            <button onClick={() => execCommand('strikeThrough')} title="Tachado"><s>S</s></button>
            <span className="toolbar-separator"></span>
            <input type="color" onChange={handleColorChange} value="#000000" title="Color de texto" />
            <input type="color" onChange={handleBackColorChange} value="#ffff00" title="Color de fondo del texto" />
            <input type="color" onChange={handleFondoChange} value={fondoColor} title="Color de fondo del correo" style={{ width: '28px', height: '28px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }} />
            <span className="toolbar-separator"></span>
            <select onChange={handleFontSize} defaultValue="16">
              <option value="10">10px</option>
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
              <option value="24">24px</option>
              <option value="32">32px</option>
            </select>
            <span className="toolbar-separator"></span>
            <button onClick={() => execCommand('justifyLeft')} title="Alinear izquierda">⬅️</button>
            <button onClick={() => execCommand('justifyCenter')} title="Centrar">⬆️</button>
            <button onClick={() => execCommand('justifyRight')} title="Alinear derecha">➡️</button>
            <button onClick={() => execCommand('justifyFull')} title="Justificar">⬌</button>
            <span className="toolbar-separator"></span>
            <button onClick={() => execCommand('insertOrderedList')} title="Lista numerada">1.</button>
            <button onClick={() => execCommand('insertUnorderedList')} title="Lista con viñetas">•</button>
            <span className="toolbar-separator"></span>
            <button onClick={handleLink} title="Insertar enlace">🔗</button>
            <button onClick={clearFormat} title="Limpiar formato">🧹</button>
          </div>

          <div className="preview-body">
            <div ref={previewRef} contentEditable={true} className="editable-preview" onInput={handlePreviewInput} />
          </div>
          <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#94a3b8' }}>
            💡 Selecciona texto y usa las herramientas para dar formato. El último selector cambia el fondo del correo.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedactarCampana;