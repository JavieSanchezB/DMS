'use client';
import { useState, useEffect, ChangeEvent  } from 'react';
import { toast } from 'nextjs-toast-notify';  // Usamos toast directamente
import "nextjs-toast-notify/dist/nextjs-toast-notify.css";
import './styles/globals.css';

export default function ConsultarPunto() {
  const [codPunto, setCodPunto] = useState('');
  const [gpsObtained, setGpsObtained] = useState(false);
  const [fechaHora, setFechaHora] = useState(''); // Estado para la fecha y hora
  const [data, setData] = useState<VisitaData | null>(null);
  const [lat, setLat] = useState<number | null>(null);
const [lon, setLon] = useState<number | null>(null);

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
    asesor?: string;
    direccion?: string;
    fecha: string;
  }
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


  
  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada por este navegador.", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }
  
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
  
      setLat(position.coords.latitude); // Ahora sí se puede asignar
      setLon(position.coords.longitude); // Ahora sí se puede asignar
      setGpsObtained(true);
  
      toast.success("GPS obtenido con éxito", {
        duration: 3000,
        position: "bottom-center",
      });
    } catch (error) {
      let errorMessage = "Error al obtener la ubicación.";
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de geolocalización denegado.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera excedido al obtener la ubicación.";
            break;
        }
      }
      toast.error(errorMessage, {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };
   
  
  const saveData = async () => {
    if (!data || lat === null || lon === null) {
        toast.error('Faltan datos para guardar la visita.', {
            duration: 3000,
            position: "bottom-center",
        });
        return;
    }

    const visitaPayload = {
        punto_id: data.cod_punto || 'No especificado',
        nombre_punto: data.punto || 'No especificado',
        circuito: data.circuito || 'No especificado',
        barrio: data.barrio || 'No especificado',
        celular: data.celular || '',
        dueno: data.dueno || 'No especificado',
        asesor: data.nombre_asesor || '',
        direccion: data.direccion || '',
        latitud: lat,
        longitud: lon,
    };

    try {
      const res = await fetch('/api/guardar-visita', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitaPayload),
    });

        if (res.ok) {
            toast.success('Datos guardados correctamente', {
                duration: 3000,
                position: "bottom-center",
            });
        } else {
            const errorData = await res.json();
            toast.error(`Error: ${errorData.error || 'No se pudo guardar'}`, {
                duration: 3000,
                position: "bottom-center",
            });
        }
    } catch (error) {
        console.error('Error al guardar los datos:', error);
        toast.error('Error inesperado al guardar los datos.', {
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
          <p><strong>Punto:</strong> {data.cod_punto || 'No disponible'}</p>
          <p><strong>Punto:</strong> {data.punto || 'No disponible'}</p>
          <p><strong>Circuito:</strong> {data.circuito || 'No disponible'}</p>
          <p><strong>Barrio:</strong> {data.barrio || 'No disponible'}</p>
          <p><strong>Celular:</strong> {data.celular || 'No disponible'}</p>
          <p><strong>Dueño:</strong> {data.dueno || 'No disponible'}</p>
          <p><strong>Asesor:</strong> {data.nombre_asesor || 'No disponible'}</p>
          <p><strong>Dirección:</strong> {data.direccion || 'No disponible'}</p>
          {/* Input para mostrar la fecha y hora */}
          <input
            type="text"
            value={fechaHora}
            disabled
            className="input fecha-hora-input"
            readOnly
          />

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

          <button 
  onClick={saveData} 
  className={`button ${gpsObtained ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
  disabled={!gpsObtained} // Desactiva el botón si no se ha obtenido el GPS
>
  Guardar
</button>

          
        </div>
      )}
    </div>
  );
}
