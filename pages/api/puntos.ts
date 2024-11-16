import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const codPunto = parseInt(req.query.cod_punto as string, 10);

  if (isNaN(codPunto)) {
    return res.status(400).json({ success: false, error: 'El parámetro cod_punto debe ser un número válido' });
  }

  try {
    const { rows } = await query('SELECT * FROM puntos_venta WHERE cod_punto = $1', [codPunto]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No se encontró información para el código ingresado' });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ success: false, error: 'Error interno en el servidor' });
  }
}
