// components/productos/FormGaleria.jsx
import React from 'react';

const FormGaleria = ({
  imagenPreview,
  handleImageChange,
  galeriaPreviews,
  handleGaleriaChange,
  eliminarImagenGaleria,
  galeriaExistente,
  eliminarImagenExistente, // ← nueva prop
}) => {
  const styles = {
    previewImage: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' },
    galeriaThumb: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Imágenes del Producto</h3>
      
      <div style={{ marginBottom: '25px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Imagen Principal</label>
        {imagenPreview ? (
          <img src={imagenPreview} alt="Vista previa" style={styles.previewImage} />
        ) : (
          <div style={styles.previewImage}>Sin imagen</div>
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginTop: '10px', width: '100%' }} />
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Galería Adicional (Máximo 10)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGaleriaChange}
          style={{ width: '100%', marginBottom: '10px' }}
          disabled={(galeriaExistente.length + galeriaPreviews.length) >= 10}
        />
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
          {/* Imágenes existentes (con botón X) */}
          {galeriaExistente.map((img) => (
            <div key={`existente-${img.id}`} style={{ position: 'relative' }}>
              <img src={`https://api.certimet.pe${img.url_imagen}`} alt="Existente" style={styles.galeriaThumb} />
              <button
                type="button"
                onClick={() => eliminarImagenExistente(img.id)}
                style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
              >
                X
              </button>
            </div>
          ))}

          {/* Imágenes nuevas (previews) */}
          {galeriaPreviews.map((src, idx) => (
            <div key={`nueva-${idx}`} style={{ position: 'relative' }}>
              <img src={src} alt={`Galería ${idx}`} style={styles.galeriaThumb} />
              <button
                type="button"
                onClick={() => eliminarImagenGaleria(idx)}
                style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormGaleria;