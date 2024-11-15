// pages/api/puntos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cod_punto } = req.query;

  if (!cod_punto) {
    return res.status(400).json({ error: 'El parámetro cod_punto es requerido' });
  }

  try {
    const { rows } = await query('SELECT * FROM puntos_venta WHERE cod_punto = $1', [cod_punto]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró información para el código ingresado' });
    }
    res.status(200).json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}
