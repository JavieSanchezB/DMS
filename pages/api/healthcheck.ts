// pages/api/healthcheck.ts
import { query } from '../../lib/db';  // O la ruta correcta a tu archivo db.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Hacemos una consulta simple para verificar la conexión
    const result = await query('SELECT 1'); // Consulta simple para verificar la conexión

    if (result) {
      res.status(200).json({ message: 'Conexión a la base de datos exitosa' });
    } else {
      res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
}
