// pages/index.tsx
import { useState } from 'react';

export default function Home() {
  const [codPunto, setCodPunto] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/puntos?cod_punto=${codPunto}`);
      if (!res.ok) {
        const { error } = await res.json();
        setError(error || 'Error al realizar la consulta');
        return;
      }

      const { data } = await res.json();
      setResult(data);
    } catch (e) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="container">
      <h1>Consulta de Puntos de Venta</h1>
      <input
        type="text"
        value={codPunto}
        onChange={(e) => setCodPunto(e.target.value)}
        placeholder="Ingrese el código del punto"
        className="input"
      />
      <button onClick={handleSearch} className="button">Buscar</button>

      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result">
          <h2>Resultado:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
