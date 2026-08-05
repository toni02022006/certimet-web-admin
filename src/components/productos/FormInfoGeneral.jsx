import React, { useState } from 'react';

const FormInfoGeneral = ({ 
  formData, 
  handleInputChange, 
  setFormData, 
  categorias, 
  marcas,
  nivel1Id = '',
  handleNivel1Change,
  nivel2Id = '',
  handleNivel2Change,
  handleNivel3Change,
  subcategoriasFiltradas = [],
  subSubcategoriasFiltradas = []
}) => {
  
  // 0 = Seleccionando normal, 2 = Escribiendo Nivel 2, 3 = Escribiendo Nivel 3
  const [nuevoNivel, setNuevoNivel] = useState(0);

  const categoriasPrincipales = categorias 
    ? categorias.filter(c => !c.parent_id || c.parent_id === null) 
    : [];

  const toggleNuevoNivel2 = () => {
    if (nuevoNivel === 2) {
      setNuevoNivel(0);
      setFormData(prev => ({ ...prev, nueva_subcategoria: '' }));
    } else {
      setNuevoNivel(2);
      handleNivel2Change({ target: { value: '' } }); 
      setFormData(prev => ({ ...prev, nueva_subcategoria: '', categoria_id: nivel1Id }));
    }
  };

  const toggleNuevoNivel3 = () => {
    if (nuevoNivel === 3) {
      setNuevoNivel(0);
      setFormData(prev => ({ ...prev, nueva_subcategoria: '' }));
    } else {
      setNuevoNivel(3);
      handleNivel3Change({ target: { value: '' } });
      setFormData(prev => ({ ...prev, nueva_subcategoria: '', categoria_id: nivel2Id }));
    }
  };

  const styles = {
    row: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' },
    formGroup: { display: 'flex', flexDirection: 'column', flex: '1 1 200px', position: 'relative' },
    fullWidthFormGroup: { display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '15px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' },
    label: { fontWeight: '500', marginBottom: '3px' },
    toggleBtn: {
      background: 'none',
      border: 'none',
      color: '#0056b3',
      cursor: 'pointer',
      fontSize: '12px',
      textAlign: 'right',
      marginTop: '4px',
      textDecoration: 'underline',
      padding: 0
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Información General</h3>
      
      {/* Fila: Nombre y SKU */}
      <div style={styles.row}>
        <div style={styles.formGroup}><label style={styles.label}>Nombre</label><input style={styles.input} type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required /></div>
        <div style={styles.formGroup}><label style={styles.label}>SKU</label><input style={styles.input} type="text" name="sku" value={formData.sku} onChange={handleInputChange} required /></div>
      </div>

      {/* Fila única: Categoría Principal (Nivel 1) */}
      <div style={styles.fullWidthFormGroup}>
        <label style={styles.label}>Categoría Principal (Nivel 1)</label>
        <select 
          style={styles.input} 
          value={nivel1Id} 
          onChange={(e) => {
            handleNivel1Change(e);
            setNuevoNivel(0);
          }} 
          required
        >
          <option value="" disabled>Seleccione...</option>
          {categoriasPrincipales.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      {/* Fila única: Subcategoría (Nivel 2) */}
      <div style={styles.fullWidthFormGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={styles.label}>Subcategoría (Nivel 2)</label>
          {nivel1Id && nuevoNivel !== 3 && (
            <button type="button" style={styles.toggleBtn} onClick={toggleNuevoNivel2}>
              {nuevoNivel === 2 ? "✕ Seleccionar existente" : "✍️ Escribir una nueva"}
            </button>
          )}
        </div>
        {!nivel1Id ? (
          <select style={styles.input} disabled>
            <option>Seleccione primero una categoría...</option>
          </select>
        ) : nuevoNivel === 2 ? (
          <input 
            style={{ ...styles.input, borderColor: '#007bff' }} 
            type="text" 
            name="nueva_subcategoria" 
            placeholder="Escribe el nombre de la nueva subcategoría..." 
            value={formData.nueva_subcategoria || ''} 
            onChange={handleInputChange}
            required
          />
        ) : (
          <select 
            style={styles.input} 
            value={nivel2Id} 
            onChange={(e) => {
              handleNivel2Change(e);
              setNuevoNivel(0);
            }}
          >
            <option value="">Seleccione (Opcional)...</option>
            {subcategoriasFiltradas.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.nombre}</option>
            ))}
          </select>
        )}
      </div>

      {/* Fila única: Sub-subcategoría (Nivel 3) */}
      <div style={styles.fullWidthFormGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={styles.label}>Sub-subcategoría (Nivel 3)</label>
          {nivel2Id && nuevoNivel !== 2 && (
            <button type="button" style={styles.toggleBtn} onClick={toggleNuevoNivel3}>
              {nuevoNivel === 3 ? "✕ Seleccionar existente" : "✍️ Escribir una nueva"}
            </button>
          )}
        </div>
        {!nivel2Id || nuevoNivel === 2 ? (
          <select style={styles.input} disabled>
            <option>{nuevoNivel === 2 ? "No disponible" : "Seleccione primero Nivel 2..."}</option>
          </select>
        ) : nuevoNivel === 3 ? (
          <input 
            style={{ ...styles.input, borderColor: '#007bff' }} 
            type="text" 
            name="nueva_subcategoria" 
            placeholder="Escribe el nombre de la 3ra categoría..." 
            value={formData.nueva_subcategoria || ''} 
            onChange={handleInputChange}
            required
          />
        ) : (
          <select 
            style={styles.input} 
            name="categoria_id" 
            value={formData.categoria_id !== nivel1Id && formData.categoria_id !== nivel2Id ? formData.categoria_id : ''} 
            onChange={handleNivel3Change}
          >
            <option value="">Ninguna / Es categoría final</option>
            {subSubcategoriasFiltradas.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.nombre}</option>
            ))}
          </select>
        )}
      </div>

      {/* Fila única: Marca */}
      <div style={styles.fullWidthFormGroup}>
        <label style={styles.label}>Marca</label>
        <select style={styles.input} name="marca_id" value={formData.marca_id} onChange={handleInputChange}>
          <option value="">Seleccione...</option>
          {marcas && marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
      </div>

      {/* Fila: Precios, stock, peso, largo (agrupados en filas de 2 o 3) */}
      <div style={styles.row}>
        <div style={styles.formGroup}><label style={styles.label}>Numero de serie</label><input style={styles.input} type="text" name="mpn" value={formData.mpn} onChange={handleInputChange} /></div>
        <div style={styles.formGroup}><label style={styles.label}>Precio Regular (S/)</label><input style={styles.input} type="number" step="0.01" name="precio_regular" value={formData.precio_regular} onChange={handleInputChange} required min="0" /></div>
        <div style={styles.formGroup}><label style={styles.label}>Precio Oferta (S/)</label><input style={styles.input} type="number" step="0.01" name="precio_oferta" value={formData.precio_oferta} onChange={handleInputChange} min="0" /></div>
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}><label style={styles.label}>Stock</label><input style={styles.input} type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" /></div>
        <div style={styles.formGroup}><label style={styles.label}>Peso (kg)</label><input style={styles.input} type="number" step="0.01" name="peso_kg" value={formData.peso_kg} onChange={handleInputChange} min="0" /></div>
        <div style={styles.formGroup}><label style={styles.label}>Largo (cm)</label><input style={styles.input} type="number" step="0.1" name="largo_cm" value={formData.largo_cm} onChange={handleInputChange} min="0" /></div>
      </div>

      {/* Fila: Slug */}
      <div style={styles.fullWidthFormGroup}>
        <label style={styles.label}>URL / Slug (SEO)</label>
        <input style={styles.input} type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="ejemplo-de-producto-antiguo"/>
        <small>Deja en blanco si es un producto nuevo (opcional)</small>
      </div>

      {/* Fila: Ancho, Alto, Garantía */}
      <div style={styles.row}>
        <div style={styles.formGroup}><label style={styles.label}>Ancho (cm)</label><input style={styles.input} type="number" step="0.1" name="ancho_cm" value={formData.ancho_cm} onChange={handleInputChange} min="0" /></div>
        <div style={styles.formGroup}><label style={styles.label}>Alto (cm)</label><input style={styles.input} type="number" step="0.1" name="alto_cm" value={formData.alto_cm} onChange={handleInputChange} min="0" /></div>
        <div style={styles.formGroup}><label style={styles.label}>Garantía (meses)</label><input style={styles.input} type="number" name="garantia_meses" value={formData.garantia_meses} onChange={handleInputChange} min="0" /></div>
      </div>

      {/* Fila: Condición e IGV */}
      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Condición</label>
          <select style={styles.input} name="condicion" value={formData.condicion} onChange={handleInputChange}>
            <option value="NUEVO">Nuevo</option>
            <option value="REACONDICIONADO">Reacondicionado</option>
            <option value="USADO">Usado</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <input 
            type="checkbox" 
            id="incluye_igv" 
            checked={formData.incluye_igv} 
            onChange={(e) => setFormData({...formData, incluye_igv: e.target.checked})} 
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="incluye_igv" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Incluye IGV</label>
        </div>
      </div>

      {/* Checkbox Destacado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px', border: '1px solid #b8daff' }}>
        <input 
          type="checkbox" id="destacado" checked={formData.destacado} 
          onChange={(e) => setFormData({...formData, destacado: e.target.checked})} 
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <label htmlFor="destacado" style={{ cursor: 'pointer', fontWeight: 'bold', color: '#004085', margin: 0 }}>
          Mostrar en "Productos Destacados"
        </label>
      </div>
    </div>
  );
};

export default FormInfoGeneral;