'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { toast } from 'nextjs-toast-notify';
import "nextjs-toast-notify/dist/nextjs-toast-notify.css";
import './styles/globals.css';
import axios from 'axios';

export default function ConsultarPunto() {
  const [codPunto, setCodPunto] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsObtained, setGpsObtained] = useState(false);
  const [fechaHora, setFechaHora] = useState('');
  const [data, setData] = useState<VisitaData | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCodPuntoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCodPunto(e.target.value);
  };

  interface VisitaData {
    cod_punto: string;
    punto: string;
    circuito: string;
    barrio: string;
    celular?: string;
    dueno: string;
    nombre_asesor?: string;
    direccion?: string;
    fecha: Date;
  }

  async function fetchPunto() {
    if (!codPunto) return;
    try {
      const res = await fetch(`/api/puntos?cod_punto=${codPunto}`);
      const responseData = await res.json();
      if (responseData.data) {
        setData(responseData.data);
        toast.success("IDPDV Encontrado", {
          duration: 1000,
          position: "bottom-center",
        });
      } else {
        console.error('No se encontraron datos');
        toast.error("No se encontró el IDPDV", {
          duration: 4000,
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error("Error al consultar el punto:", error);
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsObtained(true);
      });
    } else {
      alert("Geolocalización no soportada por este navegador.");
    }
  };

  const saveData = async () => {
    if (!data || latitude === null || longitude === null) {
      toast.error('Faltan datos para guardar la visita.', { duration: 3000 });
      return;
    }

    const visitaPayload = {
      punto_id: data.cod_punto,
      nombre_punto: data.punto,
      circuito: data.circuito,
      barrio: data.barrio,
      celular: data.celular || null,
      dueno: data.dueno,
      asesor: data.nombre_asesor || null,
      direccion: data.direccion || null,
      fecha: fechaHora,
      latitud: latitude,
      longitud: longitude,
    };

    try {
      const response = await axios.post('/api/guardar-visita', visitaPayload, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(response);
      toast.success('Datos guardados correctamente', {
        duration: 3000,
        position: 'bottom-center',
      });

      // Resetea los estados para volver al formulario inicial
      setCodPunto('');
      setData(null);
      setLatitude(null);
      setLongitude(null);
      setGpsObtained(false);
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      toast.error('Error al guardar los datos', {
        duration: 3000,
        position: 'bottom-center',
      });
    }
  };

  useEffect(() => {
    const obtenerFechaHora = () => {
      const fechaActual = new Date();
      const fechaHoraFormateada = fechaActual
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19);
      setFechaHora(fechaHoraFormateada);
    };

    obtenerFechaHora();
    const intervalo = setInterval(obtenerFechaHora, 60000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="container">
  <input
  type="number"
  value={codPunto}
  onChange={(e) => {
    const value = e.target.value;
    // Verifica que el valor sea numérico antes de actualizar el estado
    if (/^\d*$/.test(value)) {
      setCodPunto(value);
    }
  }}
  placeholder="Ingrese el código de punto"
  className="input"
/>
      <button onClick={fetchPunto} className="button">Consultar</button>

      {data && (
        <div className="data-container">
          <p><strong>IDPDV:</strong> {data.cod_punto || 'No disponible'}</p>
          <p><strong>Nombre del Punto:</strong> {data.punto || 'No disponible'}</p>
          <p><strong>Circuito:</strong> {data.circuito || 'No disponible'}</p>
          <p><strong>Barrio:</strong> {data.barrio || 'No disponible'}</p>
          <p><strong>Celular:</strong> {data.celular || 'No disponible'}</p>
          <p><strong>Dueño:</strong> {data.dueno || 'No disponible'}</p>
          <p><strong>Asesor:</strong> {data.nombre_asesor || 'No disponible'}</p>
          <p><strong>Dirección:</strong> {data.direccion || 'No disponible'}</p>
          <p><strong>Fecha Visita:</strong> {fechaHora || 'No disponible'}</p>

          <div className="gps-container">
            {!gpsObtained && (
              <button onClick={getLocation} className="button">Obtener GPS</button>
            )}
            {latitude && longitude && (
              <div>
                <p><strong>Latitud:</strong> {latitude}</p>
                <p><strong>Longitud:</strong> {longitude}</p>
              </div>
            )}
          </div>

          <button 
            onClick={saveData} 
            className={`button ${gpsObtained ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
            disabled={!gpsObtained}
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}
