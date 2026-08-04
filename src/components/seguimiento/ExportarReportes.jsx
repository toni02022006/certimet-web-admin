import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import api from '../../services/api';

// Rutas de tus imágenes
import logoMsf from '../../image/diseñoreporte/msflogo2.2.png';
import robotMsf from '../../image/diseñoreporte/msfrobot2.2.png';

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ExportarReportes = ({ tareas, usuario }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargandoDrive, setCargandoDrive] = useState(false);

  // Extraemos los datos del usuario dinámicamente
  const nombreFirma = `${usuario?.nombre || ''} ${usuario?.apellidos || ''}`.trim() || 'Juan Anthoni Otiniano Imboma';
  
  // Soporte para diferentes formas en las que pueda venir el rol desde tu backend
  const cargoDetectado = usuario?.rol || usuario?.role || usuario?.cargo || 'Software Engineer'; 
  
  // VALIDACIÓN SUPERADMIN
  const cargoFirma = cargoDetectado.toLowerCase() === 'superadmin' 
    ? 'Desarrollador de Software Full Stack' 
    : cargoDetectado;

  const formatearTiempo = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const seg = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${seg}`;
  };

  const filtrarPorPeriodo = (periodo) => {
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const diaSemana = ahora.getDay();
    const diferencia = ahora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); 
    const inicioSemana = new Date(ahora.setDate(diferencia));
    inicioSemana.setHours(0, 0, 0, 0);

    return tareas.filter(t => {
      const fechaTarea = new Date(t.fecha_creacion);
      return periodo === 'hoy' ? fechaTarea >= inicioHoy : fechaTarea >= inicioSemana;
    });
  };

  const prepararDatos = (tareasFiltradas) => {
    return tareasFiltradas.map(t => {
      let tiempoSeg = 0;
      if (t.intervalos) {
        t.intervalos.forEach(inter => {
          const inicio = new Date(inter.fecha_inicio).getTime();
          const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
          tiempoSeg += Math.floor((fin - inicio) / 1000);
        });
      }
      return {
        titulo: t.titulo,
        descripcion: t.descripcion || '-',
        empresa: t.empresa?.nombre || '-',
        categoria: t.categoria?.nombre || '-',
        tiempo: formatearTiempo(tiempoSeg),
        estado: t.estado || 'PENDIENTE',
        inicio: new Date(t.fecha_creacion).toLocaleString('es-PE'),
        fin: t.fecha_finalizacion ? new Date(t.fecha_finalizacion).toLocaleString('es-PE') : '-'
      };
    });
  };

  // ==============================
  // GENERADOR DE NOMBRE DE ARCHIVO
  // Ej: REPORTE DE ACTIVIDADES - Lunes 3 de agosto del 2026 - Juan Otiniano.png
  // ==============================
  const generarNombreEstructurado = (extension) => {
    const fecha = new Date();
    const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let fechaTexto = fecha.toLocaleDateString('es-PE', opciones);
    // Capitalizar la primera letra (ej: Lunes 3 de agosto...)
    fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);

    return `REPORTE DE ACTIVIDADES - ${fechaTexto} - ${nombreFirma}.${extension}`;
  };

  // ==============================
  // MOTOR DE CAPTURA DEL DISEÑO (Imagen y PDF)
  // ==============================
  const capturarDiseno = async (periodo) => {
    const idPlantilla = `plantilla-reporte-${periodo}`;
    const elemento = document.getElementById(idPlantilla);
    elemento.style.display = 'block'; 
    
    const canvas = await html2canvas(elemento, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#ffffff'
    });
    
    elemento.style.display = 'none'; 
    return canvas;
  };

  const exportarImagen = async (periodo) => {
    const canvas = await capturarDiseno(periodo);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = generarNombreEstructurado('png');
    link.click();
    setMenuAbierto(false);
  };

  const exportarPDF = async (periodo) => {
    const canvas = await capturarDiseno(periodo);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({ orientation: 'landscape', format: 'a4' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(generarNombreEstructurado('pdf'));
    setMenuAbierto(false);
  };

  // ==============================
  // ENVIAR A GOOGLE DRIVE (NUEVO)
  // ==============================
  const subirADrive = async (periodo, tipoFormato) => {
    setMenuAbierto(false);
    setCargandoDrive(true);

    Swal.fire({
      title: 'Subiendo a Google Drive...',
      text: 'Generando archivo y organizando tus carpetas.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const canvas = await capturarDiseno(periodo);
      let blobFinal = null;
      let nombreArchivo = '';

      if (tipoFormato === 'png') {
        nombreArchivo = generarNombreEstructurado('png');
        blobFinal = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      } else if (tipoFormato === 'pdf') {
        nombreArchivo = generarNombreEstructurado('pdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', format: 'a4' });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        blobFinal = pdf.output('blob');
      }

      if (!blobFinal) throw new Error('No se pudo procesar el archivo');

      const formData = new FormData();
      formData.append('archivo', blobFinal, nombreArchivo);
      formData.append('nombreUsuario', nombreFirma);

      await api.post('/seguimiento/exportar-drive', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({
        title: '¡Subido con éxito!',
        text: `El reporte se guardó correctamente en Google Drive en la carpeta del usuario.`,
        icon: 'success',
        confirmButtonColor: '#0F9D58'
      });

    } catch (error) {
      console.error('Error enviando a Drive:', error);
      Swal.fire('Error', 'No se pudo subir el archivo a Google Drive', 'error');
    } finally {
      setCargandoDrive(false);
    }
  };

  // ==============================
  // EXPORTAR A WORD Y EXCEL CON DISEÑO HTML
  // ==============================
  const generarTablaHTML = (periodo, tipo) => {
    const datosFiltrados = filtrarPorPeriodo(periodo);
    const datos = prepararDatos(datosFiltrados);
    const fechaStr = new Date().toLocaleDateString('es-PE');
    const tituloDoc = periodo === 'hoy' ? 'diarias' : 'semanales';
    
    let html = `
      <html ${tipo === 'excel' ? 'xmlns:x="urn:schemas-microsoft-com:office:excel"' : "xmlns:w='urn:schemas-microsoft-com:office:word'"}>
      <head>
        <meta charset='utf-8'>
        <title>Reporte MSF Creative</title>
        ${tipo === 'excel' ? `
        <!--[if gte mso 9]>
        <xml>
            <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                    <x:ExcelWorksheet>
                        <x:Name>Reporte Tareas</x:Name>
                        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                    </x:ExcelWorksheet>
                </x:ExcelWorksheets>
            </x:ExcelWorkbook>
        </xml>
        <![endif]-->` : ''}
      </head>
      <body style="font-family: Arial, sans-serif;">
        <h1 style="color: #ff7f00; text-align: center; font-size: 28px;">Reporte de actividades ${tituloDoc}</h1>
        
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="background-color: #000000; color: #ffffff; font-weight: bold; width: 150px;">Fecha:</td>
            <td>${fechaStr}</td>
            <td style="background-color: #000000; color: #ffffff; font-weight: bold; width: 150px;">Cargo:</td>
            <td>${cargoFirma}</td>
          </tr>
          <tr>
            <td style="background-color: #000000; color: #ffffff; font-weight: bold;">Nombres y Apellidos:</td>
            <td colspan="3">${nombreFirma}</td>
          </tr>
        </table>

        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <tr style="background-color: #ff7f00; color: #000000; font-weight: bold; text-align: center;">
            <th>Id</th><th>Título</th><th>Descripción</th><th>Empresa</th><th>Categoría</th><th>Tiempo</th><th>Estado</th><th>Inicio</th><th>Fin</th>
          </tr>
    `;

    datos.forEach((fila, idx) => {
      let colorEstado = '#ffffff';
      if (fila.estado === 'FINALIZADA') colorEstado = '#00ff00';
      if (fila.estado === 'PAUSADA') colorEstado = '#ffff00';

      html += `<tr>
        <td align="center">${idx + 1}</td>
        <td>${fila.titulo}</td>
        <td>${fila.descripcion}</td>
        <td align="center">${fila.empresa}</td>
        <td align="center">${fila.categoria}</td>
        <td align="center">${fila.tiempo}</td>
        <td align="center" style="background-color: ${colorEstado}; font-weight: bold;">${fila.estado}</td>
        <td align="center">${fila.inicio}</td>
        <td align="center">${fila.fin}</td>
      </tr>`;
    });

    html += `</table></body></html>`;
    return html;
  };

  const exportarDocumento = (periodo, formato) => {
    const htmlString = generarTablaHTML(periodo, formato);
    const mimeType = formato === 'excel' ? 'application/vnd.ms-excel' : 'application/msword';
    const extension = formato === 'excel' ? 'xls' : 'doc';
    
    const blob = new Blob(['\ufeff', htmlString], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generarNombreEstructurado(extension);
    link.click();
    URL.revokeObjectURL(url);
    setMenuAbierto(false);
  };

  // ==============================
  // RENDERIZADO DE PLANTILLAS OCULTAS
  // ==============================
  const datosHoy = prepararDatos(filtrarPorPeriodo('hoy'));
  const datosSemana = prepararDatos(filtrarPorPeriodo('semana'));

  const thStyle = { background: '#ff7f00', color: '#000', padding: '10px', border: '1px solid #444' };
  const tdStyle = { padding: '8px', border: '1px solid #444', fontSize: '12px' };

  const RenderPlantilla = ({ id, titulo, datos }) => (
    <div id={id} style={{ display: 'none', position: 'absolute', left: '-9999px', top: 0, width: '1200px', padding: '40px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <img src={logoMsf} alt="Logo" style={{ width: '250px', objectFit: 'contain' }} />
        <h1 style={{ color: '#ff7f00', fontSize: '36px', textAlign: 'center', margin: 0 }}>Reporte de actividades<br/>{titulo}</h1>
        <img src={robotMsf} alt="Robot" style={{ width: '120px', objectFit: 'contain' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '20px' }}>
        <div style={{ background: 'black', color: 'white', padding: '8px 15px', fontWeight: 'bold', width: '350px', display: 'flex' }}>
          <span style={{ width: '100px' }}>Fecha:</span> <span>{new Date().toLocaleDateString('es-PE')}</span>
        </div>
        <div style={{ background: 'black', color: 'white', padding: '8px 15px', fontWeight: 'bold', flex: 1, display: 'flex' }}>
          <span style={{ width: '100px' }}>Cargo:</span> <span>{cargoFirma}</span>
        </div>
      </div>
      <div style={{ background: 'black', color: 'white', padding: '8px 15px', fontWeight: 'bold', marginBottom: '30px', display: 'flex' }}>
        <span style={{ width: '220px' }}>Nombres y Apellidos:</span> <span>{nombreFirma}</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style={thStyle}>Id</th><th style={thStyle}>Título</th><th style={thStyle}>Descripción</th>
            <th style={thStyle}>Empresa</th><th style={thStyle}>Categoría</th><th style={thStyle}>Tiempo</th>
            <th style={thStyle}>Estado</th><th style={thStyle}>Inicio</th><th style={thStyle}>Fin</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, index) => (
            <tr key={index}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{fila.titulo}</td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{fila.descripcion}</td>
              <td style={tdStyle}>{fila.empresa}</td>
              <td style={tdStyle}>{fila.categoria}</td>
              <td style={tdStyle}>{fila.tiempo}</td>
              <td style={tdStyle}>
                <span style={{ 
                  background: fila.estado === 'FINALIZADA' ? '#00ff00' : fila.estado === 'PAUSADA' ? '#ffff00' : 'transparent',
                  padding: '2px 6px', fontWeight: 'bold', color: 'black'
                }}>{fila.estado}</span>
              </td>
              <td style={tdStyle}>{fila.inicio}</td>
              <td style={tdStyle}>{fila.fin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      
      {/* Plantillas Ocultas */}
      <RenderPlantilla id="plantilla-reporte-hoy" titulo="diarias" datos={datosHoy} />
      <RenderPlantilla id="plantilla-reporte-semana" titulo="semanales" datos={datosSemana} />

      {/* Botón Principal */}
      <button 
        onClick={() => setMenuAbierto(!menuAbierto)}
        disabled={cargandoDrive}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
          background: '#e2e8f0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        <IconDownload /> {cargandoDrive ? 'Subiendo...' : 'Exportar Reporte'}
      </button>

      {/* Menú Desplegable */}
      {menuAbierto && (
        <div style={{
          position: 'absolute', right: 0, top: '40px', background: 'white',
          border: '1px solid #cbd5e0', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000, width: '240px', overflow: 'hidden'
        }}>
          {/* SECCIÓN NUEVA: GOOGLE DRIVE */}
          <div style={headerDriveStyle}>☁️ Enviar a Google Drive</div>
          <button style={btnDriveStyle} onClick={() => subirADrive('hoy', 'png')}>
            Subir Imagen (Hoy)
          </button>
          <button style={btnDriveStyle} onClick={() => subirADrive('hoy', 'pdf')}>
            Subir PDF (Hoy)
          </button>

          {/* OPCIONES LOCALES ORIGINALES */}
          <div style={headerStyle}>Exportar Local</div>
          <button style={btnStyle} onClick={() => exportarPDF('hoy')}>Tareas de Hoy</button>
          <button style={btnStyle} onClick={() => exportarPDF('semana')}>Tareas de la Semana</button>
          
          <div style={headerStyle}>Exportar Imagen Local</div>
          <button style={btnStyle} onClick={() => exportarImagen('hoy')}>Tareas de Hoy</button>
          <button style={btnStyle} onClick={() => exportarImagen('semana')}>Tareas de la Semana</button>
        </div>
      )}
    </div>
  );
};

// Estilos de la interfaz
const headerStyle = { padding: '8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' };
const btnStyle = { display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f1f5f9' };

// Estilos destacados para la opción de Drive
const headerDriveStyle = { padding: '8px', background: '#e6f4ea', color: '#137333', borderBottom: '1px solid #ceead6', fontSize: '12px', fontWeight: 'bold' };
const btnDriveStyle = { display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: '#f6fbf7', color: '#137333', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #e6f4ea' };

export default ExportarReportes;