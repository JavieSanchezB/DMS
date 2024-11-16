import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
      // Manejo de preflight
      return res.status(200).end();
  }

  if (req.method === 'POST') {
      return res.status(200).json({ message: 'Visita guardada correctamente' });
  }

  res.status(405).json({ error: 'Método no permitido' });
}
