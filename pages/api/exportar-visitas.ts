import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db'; // Asume que tienes una función para consultar tu base de datos
import * as XLSX from 'xlsx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Consulta los datos de la tabla `visitas`
    const result = await query(
      'SELECT id, punto_id, nombre_punto, circuito, barrio, celular, dueno, asesor, direccion, fecha, latitud, longitud FROM visitas'
    );

    // Asegúrate de que tomas solo los datos (rows)
    const visitas = result.rows;

    if (!visitas || visitas.length === 0) {
      return res.status(404).json({ message: 'No se encontraron visitas para exportar' });
    }

    // Prepara los datos en un formato para Excel
    const worksheet = XLSX.utils.json_to_sheet(visitas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitas');

    // Genera el archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Configura la respuesta para la descarga del archivo
    res.setHeader('Content-Disposition', 'attachment; filename=visitas.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exportando visitas:', error);
    res.status(500).json({ message: 'Error al exportar las visitas' });
  }
}
