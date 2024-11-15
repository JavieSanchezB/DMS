'use client';
import { useState, useEffect } from 'react';
import { toast } from 'nextjs-toast-notify';  // Usamos toast directamente
import "nextjs-toast-notify/dist/nextjs-toast-notify.css";
import './styles/globals.css';

export default function ConsultarPunto() {
  const [codPunto, setCodPunto] = useState('');
  const [data, setData] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [gpsObtained, setGpsObtained] = useState(false);
  const [fechaHora, setFechaHora] = useState(''); // Estado para la fecha y hora

  const handleCodPuntoChange = (e: unknown) => {
    setCodPunto(e.target.value);
  };

  async function fetchPunto() {
    if (!codPunto) return;
    const res = await fetch(`/api/puntos?cod_punto=${codPunto}`);
    const responseData = await res.json();
    if (responseData.data) {
      setData(responseData.data);  // Asigna el objeto 'data' correctamente
      toast.success("IDPDV Encontrado", {
        duration: 4000,
        position: "bottom-center",
        transition: "popUp",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>',
      });
    } else {
      console.error('No se encontraron datos');
      toast.error("No se encontró el IDPDV", {
        duration: 4000,
        position: "bottom-center",
      });
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
        setGpsObtained(true);  // Ocultar el botón al obtener la ubicación
        toast.success("GPS obtenido con éxito", {
          duration: 3000,
          position: "bottom-center",
        });
      });
    } else {
      alert("Geolocalización no soportada por este navegador.");
    }
  };

  const saveData = async () => {
    if (!data || lat === null || lon === null) return;

    const res = await fetch('/api/guardar-visita', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, lat, lon }),
    });

    if (res.ok) {
      toast.success('Datos guardados correctamente', {
        duration: 3000,
        position: "bottom-center",
      });
    } else {
      toast.error('Error al guardar los datos', {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  // Función para obtener la fecha y hora actuales
  useEffect(() => {
    const obtenerFechaHora = () => {
      const fechaActual = new Date();
      const fechaHoraFormateada = fechaActual.toLocaleString();  // Formatea la fecha y hora en formato local
      setFechaHora(fechaHoraFormateada);
    };

    obtenerFechaHora();
    // Actualiza la fecha y hora cada minuto
    const intervalo = setInterval(obtenerFechaHora, 60000);

    // Limpia el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="container">
      <input
        type="text"
        value={codPunto}
        onChange={handleCodPuntoChange}
        placeholder="Ingrese el código de punto"
        pattern="[0-9]*"
        className="input"
      />
      <button onClick={fetchPunto} className="button">Consultar</button>

      {data && (
        <div className="data-container">
          <p><strong>Punto:</strong> {data.punto || 'No disponible'}</p>
          <p><strong>Circuito:</strong> {data.circuito || 'No disponible'}</p>
          <p><strong>Barrio:</strong> {data.barrio || 'No disponible'}</p>
          <p><strong>Celular:</strong> {data.celular || 'No disponible'}</p>
          <p><strong>Dueño:</strong> {data.dueno || 'No disponible'}</p>
          <p><strong>Asesor:</strong> {data.nombre_asesor || 'No disponible'}</p>
          <p><strong>Dirección:</strong> {data.direccion || 'No disponible'}</p>

          <div className="gps-container">
            {!gpsObtained && (
              <button onClick={getLocation} className="button">Obtener GPS</button>
            )}
            {lat && lon && (
              <div>
                <p><strong>Latitud:</strong> {lat}</p>
                <p><strong>Longitud:</strong> {lon}</p>
              </div>
            )}
          </div>

          <button onClick={saveData} className="button">Guardar</button>

          {/* Input para mostrar la fecha y hora */}
          <input
            type="text"
            value={fechaHora}
            disabled
            className="input fecha-hora-input"
            readOnly
          />
        </div>
      )}
    </div>
  );
}
