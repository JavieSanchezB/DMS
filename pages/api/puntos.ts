// pages/api/puntos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db'; // Asumiendo que tienes una función query en lib/db.ts

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cod_punto } = req.query;

  // Verifica si el parámetro 'cod_punto' está presente
  if (!cod_punto) {
    return res.status(400).json({ error: 'El parámetro cod_punto es requerido' });
  }

  try {
    // Ejecuta la consulta SQL en la base de datos para buscar el 'cod_punto'
    const { rows } = await query('SELECT * FROM puntos_venta WHERE cod_punto = $1', [cod_punto]);

    // Si no se encuentra el 'cod_punto', devuelve un error 404
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró información para el código ingresado' });
    }

    // Si se encuentra el punto de venta, devuelve los resultados
    res.status(200).json({ data: rows[0] });
    
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // En caso de error en la consulta a la base de datos, devuelve un error 500
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}
