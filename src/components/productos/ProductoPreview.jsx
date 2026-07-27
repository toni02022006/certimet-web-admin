// src/components/productos/ProductoPreview.jsx
import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus, FileText, Truck, Store } from 'lucide-react';
import './ProductoPreview.css';

// Importación de imágenes (Ajusta las rutas si es necesario)
import logoMastercard from '../../image/tienda/MasterCard_Logo.png';
import logoPagoEfectivo from '../../image/tienda/pago-efectivo-2020.svg';
import logoPlin from '../../image/tienda/plin-logo.png';
import logoVisa from '../../image/tienda/Visalogo.svg';
import logoYape from '../../image/tienda/yape-logo.png';

const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.22 5.22 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const ProductoPreview = ({ 
  formData, 
  imagenPreview, 
  categorias, 
  fullWidth = false,
  galeriaPreviews = [],
  galeriaExistente = []
}) => {
  const catSeleccionada = categorias.find(c => c.id === parseInt(formData.categoria_id));
  const nombreCategoria = catSeleccionada ? catSeleccionada.nombre : 'CERTIMET';
  
  const [imagenActiva, setImagenActiva] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  // Estado para el acordeón
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    descripcion: false,
    detallada: false,
    especificaciones: false
  });

  const urlBase = import.meta.env.VITE_API_URL;
  const imagenPrincipal = imagenPreview || null;
  
  const todasLasImagenes = [
    ...galeriaExistente.map(img => ({ url: `${urlBase}${img.url_imagen}`, id: img.id })),
    ...galeriaPreviews.map(src => ({ url: src, id: `preview-${Math.random()}` }))
  ];

  const imagenGrande = imagenActiva || imagenPrincipal || null;

  const limpiarHTML = (html) => html ? html.replace(/&nbsp;/g, ' ') : '';
  const restarCantidad = () => setCantidad(c => Math.max(1, c - 1));
  const sumarCantidad = () => setCantidad(c => Math.min(parseInt(formData.stock) || 1, c + 1));
  
  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas(prev => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  const precioFinal = formData.precio_oferta ? formData.precio_oferta : formData.precio_regular || '0.00';

  // ==========================================
  // VISTA COMPACTA (Cuando no es fullWidth)
  // ==========================================
  if (!fullWidth) {
    return (
      <div className="preview-compact-container">
        <h3 className="preview-compact-titulo">Vista Previa Resumida</h3>
        <div className="preview-compact-row">
          {imagenPrincipal ? (
            <img src={imagenPrincipal} alt="Preview" className="preview-compact-img" />
          ) : (
            <div className="preview-compact-img-placeholder">Sin foto</div>
          )}
          <div className="preview-compact-info">
            <h4>{formData.nombre || 'Nombre del Producto'}</h4>
            <div className="preview-compact-precio">
              S/ {precioFinal}
              {formData.precio_oferta && <span className="precio-tachado">S/ {formData.precio_regular}</span>}
            </div>
            <div className="preview-compact-meta">
              <strong>SKU:</strong> {formData.sku || '---'} | <strong>Stock:</strong> {formData.stock || '0'} unid.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA TIENDA COMPLETA (fullWidth)
  // ==========================================
  return (
    <div className="preview-detalle-container">
      
      <div className="preview-two-column">
        {/* COLUMNA IZQUIERDA: IMÁGENES */}
        <div className="preview-col-izq">
          <nav className="preview-breadcrumb">
            <span>Tienda</span> › <span>Catálogo</span> › <span>{nombreCategoria}</span> › <span className="current">{formData.nombre || 'Producto'}</span>
          </nav>

          <div className="preview-imagenes-wrapper">
            <div className="preview-galeria-grid">
              <div className="preview-miniaturas">
                {imagenPrincipal && (
                  <img 
                    src={imagenPrincipal} 
                    alt="Principal" 
                    className={`miniatura ${imagenActiva === imagenPrincipal ? 'activa' : ''}`}
                    onMouseEnter={() => setImagenActiva(imagenPrincipal)}
                  />
                )}
                {todasLasImagenes.map((img) => (
                  <img 
                    key={img.id} 
                    src={img.url} 
                    alt="Galería" 
                    className={`miniatura ${imagenActiva === img.url ? 'activa' : ''}`}
                    onMouseEnter={() => setImagenActiva(img.url)}
                  />
                ))}
              </div>
              
              <div className="preview-imagen-principal">
                {imagenGrande ? (
                  <img src={imagenGrande} alt="Producto" />
                ) : (
                  <span className="placeholder">📷 Sin imagen</span>
                )}
              </div>
            </div>

            <div className="preview-btn-descargar-box">
              <button className="preview-btn-descargar">
                <FileText size={18} /> Descargar ficha técnica
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: INFO Y COMPRA */}
        <div className="preview-col-der">
          <div className="preview-header-info">
            <div className="preview-marca">{nombreCategoria}</div>
            <h1 className="preview-titulo-prod">{formData.nombre || 'Nombre del Producto'}</h1>
            <div className="preview-meta">
              <span>SKU {formData.sku || '---'}</span>
              <span className="divider">|</span>
              <span>Stock disponible: {parseInt(formData.stock) > 0 ? formData.stock : <span style={{color: '#d32f2f'}}>0</span>}</span>
            </div>
          </div>

          <div className="preview-precio-caja">
            <span className="moneda">S/</span> {Number(precioFinal).toFixed(2)}
            <span className="igv">Inc. IGV</span>
          </div>

          <hr className="preview-separador" />

          {parseInt(formData.stock) > 0 ? (
            <div className="preview-bloque-compras">
              <div className="fila-compras-1">
                <div className="selector-cantidad">
                  <button type="button" onClick={restarCantidad}><Minus size={16}/></button>
                  <span className="numero">{cantidad}</span>
                  <button type="button" onClick={sumarCantidad}><Plus size={16}/></button>
                </div>
                <button type="button" className="btn-agregar-carro">
                  <ShoppingCart size={18} /> Agregar al carro
                </button>
              </div>
              <div className="fila-compras-2">
                <button type="button" className="btn-comprar-wsp">
                  <WhatsappIcon /> Comprar por WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <div className="preview-agotado">Agotado temporalmente</div>
          )}

          <hr className="preview-separador" />

          <div className="preview-metodos-pago">
            <img src={logoVisa} alt="Visa" />
            <img src={logoPagoEfectivo} alt="Pago Efectivo" />
            <img src={logoMastercard} alt="MasterCard" />
            <img src={logoYape} alt="Yape" />
            <img src={logoPlin} alt="Plin" />
          </div>

          <hr className="preview-separador" />

          <div className="preview-logistica">
            <div className="logistica-item">
              <Truck size={24} className="icono" />
              <div>
                <h4>Envíos</h4>
                <p>Envíos en Lima: 1 a 2 días hábiles</p>
                <p>Envío a Provincia: 2 a 4 días hábiles</p>
              </div>
            </div>
            <div className="logistica-item">
              <Store size={24} className="icono" />
              <div>
                <h4>Retiro en oficina</h4>
                <p>Lunes a Viernes de 8:30 am - 6:00 p.m</p>
                <p>Sábados de 08:30 am. - 11:00 a.m</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIONES INFERIORES: ACORDEÓN */}
      <div className="preview-acordeon-container">
        
        {/* Descripción Corta */}
        {formData.descripcion_corta && (
          <div className="preview-acordeon-item">
            <div className="acordeon-cabecera" onClick={() => toggleSeccion('descripcion')}>
              <h2>Descripción</h2>
              {seccionesAbiertas.descripcion ? <Minus size={20} /> : <Plus size={20} />}
            </div>
            {seccionesAbiertas.descripcion && (
              <div 
                className="acordeon-cuerpo descripcion-html"
                dangerouslySetInnerHTML={{ __html: limpiarHTML(formData.descripcion_corta) }} 
              />
            )}
          </div>
        )}

        {/* Descripción Detallada */}
        {formData.descripcion_detallada && (
          <div className="preview-acordeon-item">
            <div className="acordeon-cabecera" onClick={() => toggleSeccion('detallada')}>
              <h2>Descripción Detallada</h2>
              {seccionesAbiertas.detallada ? <Minus size={20} /> : <Plus size={20} />}
            </div>
            {seccionesAbiertas.detallada && (
              <div 
                className="acordeon-cuerpo descripcion-html"
                dangerouslySetInnerHTML={{ __html: limpiarHTML(formData.descripcion_detallada) }} 
              />
            )}
          </div>
        )}

        {/* Especificaciones Técnicas */}
        {formData.descripcion_tecnica && (
          <div className="preview-acordeon-item">
            <div className="acordeon-cabecera" onClick={() => toggleSeccion('especificaciones')}>
              <h2>Especificaciones</h2>
              {seccionesAbiertas.especificaciones ? <Minus size={20} /> : <Plus size={20} />}
            </div>
            {seccionesAbiertas.especificaciones && (
              <div 
                className="acordeon-cuerpo descripcion-html"
                dangerouslySetInnerHTML={{ __html: limpiarHTML(formData.descripcion_tecnica) }} 
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductoPreview;