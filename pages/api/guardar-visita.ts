import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';
import Cors from 'nextjs-cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  await Cors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type'], // Cabeceras permitidas
    origin: '*', // Origen permitido, puede ser "*" para permitir todos
  });
  res.status(200).json({ message: 'CORS habilitado' });
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { punto_id, nombre_punto, circuito, barrio, celular, dueno, asesor, direccion, fecha, latitud, longitud } = req.body;

    if (!punto_id || !nombre_punto || !circuito || !barrio || !dueno || !fecha || latitud === undefined || longitud === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
      const queryText = `
        INSERT INTO visitas (
          punto_id, nombre_punto, circuito, barrio, celular,
          dueno, asesor, direccion, fecha, latitud, longitud
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
      `;
      const values = [punto_id, nombre_punto, circuito, barrio, celular || null, dueno, asesor || null, direccion || null, fecha, latitud, longitud];
      const result = await query(queryText, values);

      return res.status(201).json({
        message: 'Visita guardada correctamente',
        visitaId: result.rows[0].id,
      });
    } catch (error) {
      console.error('Error al guardar la visita:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}
