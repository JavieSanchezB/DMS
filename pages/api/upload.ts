import { IncomingForm } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import xlsx from 'xlsx';
import { query } from '../../lib/db';

// Configuración de formidable para manejo de archivos
export const config = {
  api: {
    bodyParser: false, // Desactivar el parseo por defecto para manejar el archivo
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new IncomingForm();

  // Procesar el archivo con un manejo adecuado de errores
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error al procesar el archivo:', err);
      return res.status(500).json({ error: 'Error al procesar el archivo' });
    }

    const file = files.file ? files.file[0] : null;
    if (!file) {
      console.error('No se ha proporcionado un archivo');
      return res.status(400).json({ error: 'No se ha proporcionado un archivo' });
    }

    try {
      console.log('Leyendo archivo:', file.filepath);

      // Leer el archivo Excel
      const workbook = xlsx.readFile(file.filepath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convertir los datos del archivo Excel a un arreglo de objetos
      const data = xlsx.utils.sheet_to_json(sheet);
      console.log('Datos del archivo:', data);

      // Definir las columnas esperadas en la base de datos
      const columns = [
        'cod_punto', 'punto', 'statepos', 'canal', 'tipo_punto', 'circuito', 'caracteristica_circuito',
        'nit', 'telefono', 'celular', 'dueno', 'tipo_doc', 'documento', 'horario', 'categoria', 'departamento',
        'ciudad', 'barrio', 'direccion', 'latitud', 'longitud', 'accesibilidad', 'visibilidad', 'trafico',
        'segmentacion_geografica', 'estado_dms', 'tipo_factura', 'estado_pop', 'permite_pop', 'tiene_pop',
        'mapa_referencia', 'fecha_creacion', 'fecha_ultima_modificacion', 'formulario_fisico', 'id_distribuidor',
        'distribuidor', 'distribuidor_padre', 'territorios', 'estado_epin', 'moviles_epin', 'cod_epin', 'moviles_tigo_money',
        'cod_tigo_money', 'cod_sub', 'movil_epin_vendedor', 'codigo_epin_vendedor', 'sucursal', 'proveedores',
        'bloqueo', 'motivo_bloqueo', 'reventa_simcard', 'reventa_tarjeta_prepago', 'go_blue', 'contacto_tigo_money',
        'identificacion_contacto_tigo_money', 'entidad_financiera', 'numero_cuenta', 'cod_categoria_pdl',
        'cod_categoria_cod_act_pospago', 'cod_categoria_cod_act_prepago', 'cod_categoria_codigo_vas',
        'cod_categoria_movil_activador', 'cod_categoria_movil_activador_pospago', 'cod_categoria_movil_venta_vas',
        'prod_simcard', 'prod_epin', 'prod_tarjeta_prepago', 'prod_gestor_recarga_elect', 'prod_giros', 'prod_dth',
        'serv_tarj_prepago_tigo', 'serv_e_pin_tigo', 'serv_simcard_tigo', 'serv_baloto', 'serv_movil_red',
        'serv_recarga_movil', 'serv_movilway', 'serv_otro_gestor', 'serv_gestor_recarga_visita', 'serv_full_carga',
        'serv_codesa', 'serv_pto_naranja', 'serv_provar', 'serv_conexred', 'serv_mbox', 'serv_datacent', 'serv_gana',
        'serv_point_p', 'serv_vas_tigo', 'serv_pospago_tigo', 'serv_blackcard_tigo', 'serv_telefonos', 'serv_rec_linea_claro',
        'serv_tarj_prep_claro', 'serv_pospago_claro', 'serv_modem_claro', 'serv_modem_pre_tigo', 'serv_tarj_prep_movistar',
        'serv_modem_movistar', 'serv_pospago_movistar', 'serv_dddedo', 'serv_sim_claro', 'serv_sim_movistar', 'serv_procesa',
        'serv_qiwi', 'serv_smartcard_tigo', 'serv_computador', 'serv_chip_rescate', 'serv_sim_uff', 'serv_modem_une',
        'serv_giros_tigo', 'serv_paquetiogos', 'serv_android_card', 'serv_green_card', 'serv_tablets', 'serv_blackberry',
        'serv_smartphone', 'serv_feature_phone', 'serv_vastrix', 'serv_sim_virgin', 'serv_ftre_ph_du_sim', 'serv_modem',
        'serv_equip_comodato', 'serv_lowend', 'serv_megared', 'serv_masa_inver', 'serv_dth', 'fecha_ultima_visita',
        'id_empleado_ultima_visita', 'nombre_empleado_ultima_visita', 'posicion_empleado_ultima_visita',
        'longitud_ultima_visita', 'latitud_ultima_visita', 'empleado_padre_ultima_visita', 'vendedor_dealer_asociado',
        'subdistribuidor_pos_asociado', 'nombre_asesor'
      ];

      // Verificar que todas las columnas necesarias estén en el archivo
      const excelColumns = Object.keys(data[0]);
      const missingColumns = columns.filter(col => !excelColumns.includes(col));
      // if (missingColumns.length > 0) {
      //   return res.status(400).json({ error: 'Faltan columnas en el archivo', missingColumns });
      // }

      // Insertar los datos en la base de datos de manera eficiente (lotes)
      const insertPromises = data.map(async (row) => {
        const values = columns.map(col => {
          let value = row[col];
          if (typeof value === 'string') {
            value = value.replace(/'/g, "''"); // Escapar comillas simples
          }
          return value || null; // Asegurarse de que valores vacíos sean null
        });

        const queryText = `
          INSERT INTO puntos_venta (${columns.join(', ')})
          VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')})
        `;

        // Ejecutar la consulta de inserción
        await query(queryText, values);
      });

      await Promise.all(insertPromises); // Esperar todas las inserciones

      res.status(200).json({ message: 'Datos cargados correctamente en la base de datos' });
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      res.status(500).json({ error: 'Error al cargar los datos en la base de datos' });
    }
  });
};

export default handler;
