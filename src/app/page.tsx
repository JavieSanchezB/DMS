import { sql } from '@vercel/postgres';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Obtener el COD.PUNTO desde los parámetros de la consulta
  const { cod_punto } = req.query;
  
  // Validar que el parámetro 'cod_punto' esté presente en la consulta
  if (!cod_punto) {
    return res.status(400).json({ error: 'El parámetro cod_punto es requerido' });
  }

  try {
    // Realizar la consulta SQL para obtener los datos
    const { rows } = await sql`
      SELECT * 
      FROM tabla_puntos  -- Usa el nombre correcto de tu tabla
      WHERE "COD.PUNTO" = ${cod_punto}
    `;
    
    // Responder con los resultados obtenidos
    if (rows.length > 0) {
      res.status(200).json({ data: rows });
    } else {
      res.status(404).json({ error: 'No se encontraron resultados' });
    }
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ error: 'Error al realizar la consulta a la base de datos' });
  }
}
