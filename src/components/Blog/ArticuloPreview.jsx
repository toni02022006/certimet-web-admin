import React from 'react';
import './ArticuloPreview.css';

const ArticuloPreview = ({ articulo }) => {
  const {
    titulo,
    subtitulo,
    categoria,
    fecha_publicacion,
    minutos_lectura,
    imagen_url,
    contenido
  } = articulo || {};

  const fechaBonita = fecha_publicacion
    ? new Date(fecha_publicacion + 'T00:00:00').toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : 'Fecha de publicación';

  return (
    <article className="articulo-elegante-page preview-mode">
      {/* BARRA DE PROGRESO DE LECTURA SIMULADA */}
      <div className="barra-progreso-lectura" style={{ transform: 'scaleX(0.3)' }} />

      {/* HEADER COMPACTO Y AZUL */}
      <header className="header-compacto">
        <div className="header-limite">
          <div className="link-retorno">
            <span className="flecha-hover">←</span> Volver a los artículos
          </div>

          <div className="header-textos">
            <span className="etiqueta-categoria">
              {categoria || 'CATEGORÍA'}
            </span>
            
            <h1 className="titulo-principal">
              {titulo ? titulo : 'Título principal del artículo aparecerá aquí...'}
            </h1>
            
            {subtitulo && (
              <p className="subtitulo-header">
                {subtitulo}
              </p>
            )}

            <div className="fila-meta">
              <div className="meta-item">
                <span className="icono-meta">✍️</span>
                <span>Autor (Tú)</span>
              </div>
              <span className="punto-separador">•</span>
              <div className="meta-item">
                <span className="icono-meta">📅</span>
                <span>{fechaBonita}</span>
              </div>
              <span className="punto-separador">•</span>
              <div className="meta-item">
                <span className="icono-meta">⏱️</span>
                <span>{minutos_lectura || 1} min lectura</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CUERPO DEL ARTÍCULO */}
      <main className="cuerpo-ancho">
        {imagen_url ? (
          <div className="marco-imagen">
            <div className="mascara-hover">
              <img 
                src={imagen_url} 
                alt={titulo || 'Preview'} 
                className="imagen-proporcional animacion-zoom" 
              />
            </div>
          </div>
        ) : (
          <div className="marco-imagen placeholder-imagen-box">
            <div className="mascara-hover placeholder-inner">
              <span>🖼️ La imagen de portada aparecerá aquí</span>
            </div>
          </div>
        )}

        <div className="contenedor-texto-amplio">
          {contenido && contenido !== '<p><br></p>' ? (
            <div 
              className="quill-contenido-limpio"
              dangerouslySetInnerHTML={{ __html: contenido }}
            />
          ) : (
            <div className="quill-contenido-limpio preview-contenido-placeholder">
              <p>El contenido redactado en el editor aparecerá aquí en tiempo real con todos sus formatos, tablas y estilos...</p>
            </div>
          )}
        </div>

        <footer className="footer-sencillo">
          <span className="boton-verde-final">
            Explorar más publicaciones
          </span>
        </footer>
      </main>
    </article>
  );
};

export default ArticuloPreview;