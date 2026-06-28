export default {
  'app.title': 'GrindCash',
  'toc.filter': 'Filtrar índice...',
  'title.current_file': 'Archivo abierto actualmente',
  'filename.unsaved': 'NoGuardado.cash',
  'btn.install': '↓ Instalar aplicación',
  'dict.select': 'Seleccionar diccionario',
  'dict.select_title': 'Seleccione un diccionario para sugerencias automáticas',
  'dict.custom': 'Dict: Personalizado',
  'dict.none': 'Sugerencias: Apagado',
  'dict.general': 'Dict: Negocios generales',

  'placeholder.password': 'Contraseña de cifrado...',
  'title.password_help': 'Introducir una contraseña cifrará fuertemente el archivo al guardar.',
  'title.toggle_password': 'Alternar visibilidad de contraseña',
  'btn.open': 'Abrir',
  'btn.save': 'Guardar',
  'title.cmd': 'Abrir paleta de comandos',
  'status.loading': 'Iniciando motor SQLite...',
  'filter.all': 'Todos los períodos',
  'period.all': 'Todos los períodos',
  'period.jan_mar': 'Ene-Mar',
  'period.apr_jun': 'Abr-Jun',
  'period.jul_sep': 'Jul-Sep',
  'period.oct_dec': 'Oct-Dic',
  'period.this_year': 'Este año (Ene-Dic)',
  'period.prev_fiscal_year': 'Año fiscal anterior',
  'period.this_fiscal_year': 'Año fiscal actual',
  'title.change_fiscal_start_month': 'Cambiar mes de inicio del año fiscal',
  'placeholder.new_block': 'Crear nuevo bloque (ej., Viaje de negocios mayo 2026) ...',
  'btn.expand_all': 'Expandir todo',
  'btn.collapse_all': 'Contraer todo',
  'error.fatal': 'Error al iniciar la aplicación',
  'error.fatal_desc':
    'No se pudieron cargar los archivos requeridos.<br />Por favor, compruebe su conexión y vuelva a cargar la página.',
  'btn.reload': 'Recargar página',
  'csv.title': 'Configuración de importación CSV',
  'csv.desc': 'Asignar columnas CSV a campos de GrindCash.',
  'csv.date': 'Columna de fecha',
  'csv.optional': '(Opcional)',
  'csv.account': 'Columna de cuenta',
  'csv.memo': 'Columna de descripción',
  'csv.amount': 'Columna de cantidad',
  'csv.preview': 'Vista previa de datos (Primeras filas)',
  'csv.skip_first': 'Omitir las primeras',
  'csv.skip_rows': 'filas',
  'csv.encoding': 'Codificación:',
  'btn.cancel': 'Cancelar',
  'btn.import': 'Importar',
  'export.title': 'Exportación CSV',
  'export.desc': 'Seleccione el formato del software de contabilidad para exportar.',
  'export.format': 'Formato de salida',
  'btn.export': 'Exportar',
  'dict_edit.title': 'Editar diccionario personalizado',
  'dict_edit.desc':
    'Registre y reordene las cuentas de uso frecuente.<br />Haga clic en el icono del ojo para ocultar de las sugerencias.',
  'btn.show_all': 'Mostrar todo',
  'btn.hide_all': 'Ocultar todo',
  'placeholder.new_account': 'Añadir nueva cuenta',
  'btn.add': 'Añadir',
  'btn.save_close': 'Guardar y cerrar',
  'prompt.pw_title': 'Introducir contraseña',
  'prompt.pw_desc': 'El archivo está cifrado. Introduzca la contraseña para descifrar:',
  'btn.ok': 'Aceptar',
  'prompt.ios_install_btn': 'Añadir a la pantalla de inicio',
  'drop.title': 'Suelte el archivo .cash aquí para abrirlo',
  'drop.desc1': 'También puede sobrescribir y guardar directamente.',
  'drop.desc2': '* Haga clic en cualquier lugar para cerrar esta pantalla.',
  'cmd.search': 'Búsqueda de comandos',
  'cmd.placeholder': 'Escriba un comando o busque...',

  // main.js inside strings:
  'toast.restored': 'Datos no guardados restaurados',
  'toast.saved': 'Los datos se han guardado',
  'toast.copied': 'Copiado al portapapeles',
  'alert.restore_fail': '⚠️ Error al restaurar porque la copia de seguridad anterior está dañada.',
  'confirm.discard_changes': 'Tiene cambios sin guardar. ¿Descartarlos y abrir otro archivo?',
  'confirm.pw_empty':
    '⚠️ ADVERTENCIA ⚠️\nLa contraseña está vacía.\nGuardar ahora eliminará el cifrado y guardará en texto plano.\n\n¿Está seguro de que desea eliminar el cifrado?',
  'alert.pw_empty_canceled': 'Guardado cancelado. Por favor, establezca una contraseña.',
  'alert.pw_mismatch': '❌ Las contraseñas no coinciden. Guardado cancelado.',
  'alert.write_permission_fail':
    'No se pudo obtener el permiso de escritura. El navegador puede haberlo revocado.\n\nPor favor, intente "Guardar como".',
  'toast.saved_to': 'Datos guardados en "{0}"',
  'toast.save_error':
    'Error: No se pudo guardar el archivo. Compruebe la capacidad del disco y los permisos.',
  'alert.multi_tab':
    '⚠️ GrindCash ya está abierto en otra pestaña o ventana.\n\nPara evitar conflictos de datos, no edite en esta pestaña.',
  'alert.http_desc':
    '⚠️ ADVERTENCIA DE SEGURIDAD ⚠️\n\nEn el entorno de acceso actual (HTTP), la lectura/escritura de archivos y el cifrado están bloqueados por restricciones de seguridad del navegador.\n\nPara ejecutar GrindCash normalmente, cárguelo a un entorno "HTTPS" o ejecútelo en "localhost".',
  'error.http_required': 'Error: Se requiere un entorno HTTPS o localhost',

  // templates
  'prompt.save_tpl_title':
    'Guardar este bloque como plantilla.\nIntroduzca el nombre de la plantilla:',
  'toast.tpl_saved':
    '✅ Plantilla "{0}" guardada.\nPuede llamarla en cualquier momento desde la paleta de comandos (Cmd+K).',
  'confirm.delete_tpl': '¿Eliminar plantilla "{0}"?',
  'cmd.insert': '[Insertar] {0}',
  'cmd.delete': '[Eliminar] {0}',

  // command titles:
  'cmd.save_title': 'Guardar datos (Guardar)',
  'cmd.open_title': 'Abrir archivo (Abrir)',
  'cmd.saveas_title': 'Guardar como copia (Guardar como)',
  'cmd.new_title': 'Crear nuevo bloque (Nuevo)',
  'export.unexported_only':
    'Exportar solo registros no exportados (marcar como exportados después)',
  'cmd.import_title': 'Importar CSV (Importar CSV)',
  'cmd.export_title': 'Exportar CSV (Exportar CSV)',
  'cmd.editdict_title': 'Editar diccionario de cuentas personalizado',
  'cmd.ai_title': 'Copiar prompt de formato IA (IA)',
  'cmd.markdown_title': 'Copiar lista como Markdown (para GrindSite)',
  'cmd.expandall_title': 'Expandir todos los bloques',
  'cmd.collapseall_title': 'Contraer todos los bloques',
  'cmd.calc_copied': 'Copiado {0}',
  'cmd.calc_inserted': 'Insertado {0} directamente',

  // index.html/main.js logic labels
  'label.grand_total': 'Cantidad total',
  'label.period_info_all': '💡 Exportando datos actualmente para <b>todos los períodos</b>.',
  'label.period_info_filtered': '💡 Exportando datos actualmente para <b>"{0}"</b>.',
  'label.empty_blocks': 'Sin datos de transacciones.',
  'label.period': 'Período',
  'label.tag_modal_title': '{0} ({1} elementos)',
  'label.no_date': 'Sin fecha',
  'label.unclassified': 'Sin clasificar',
  'label.unnamed': 'Sin nombre',
  'label.undecided': 'Indeciso',
  'toast.no_copy_data': 'No hay datos para copiar.',
  'toast.md_copied': 'Copiado como Markdown',
  'toast.import_success': 'Importados {0} elementos',
  'toast.import_skip': ' ({0} omitidos debido a cantidad no válida)',
  'error.import_fail': 'Ocurrió un error durante la importación.',
  'toast.filter_outside':
    'Período restablecido a "Todos" porque la fecha añadida estaba fuera del filtro actual.',
  'tooltip.edit_date': 'Haga clic para editar la fecha (Soporta AAAA/MM/DD)',

  // custom dict editor:
  'dict_edit.show': 'Mostrar',
  'dict_edit.hide': 'Ocultar',
  'dict_edit.delete_title': 'Eliminar completamente',

  // fiscal year start month change:
  'prompt.fiscal_month': 'Introduzca el mes de inicio del año fiscal (1-12):',
  'alert.invalid_fiscal_month': 'Por favor, introduzca un número entre 1 y 12.',
  'confirm.sort_by_date':
    '¿Ordenar los elementos de este bloque por "más antiguos primero"?\n(Los elementos con la misma fecha mantienen su orden original)',
  'confirm.restore_draft':
    'Se encontraron datos de copia de seguridad no guardados de su última sesión.\n\n¿Restaurarlos?\n(Seleccionar Cancelar descartará la copia de seguridad)',
  'toast.prompt_copied': 'Prompt de IA copiado',
  'toast.sorted': 'Ordenado por fecha',
  'toast.settlement_created': 'Registro de liquidación creado.',
  'toast.split_applied': 'División aplicada: Bruto {0} y Comisión {1}',
  'toast.split_added': 'Añadido Bruto ({0}) y {1} ({2})',
  'error.split_no_focus':
    'Por favor, haga clic o enfoque en un campo de cantidad primero para aplicar la división de comisiones.',
  'error.split_no_amount': 'Por favor, introduzca una cantidad primero.',
  'error.split_invalid': 'Valor de cantidad no válido.',
  'toast.privacy_toggled': 'Modo de privacidad alternado',
  'toast.app_updated_reload':
    'Aplicación actualizada. <a href="#" id="toast-reload-btn" class="ml-2 font-bold underline cursor-pointer">Recargar para aplicar</a>',
  'toast.sqlite_loaded': 'Motor SQLite iniciado correctamente',
  'toast.sqlite_load_fail': 'Error: No se pudo iniciar el motor SQLite',
  'placeholder.account': 'Cuenta',
  'dict_edit.add_label': 'Añadir nueva cuenta',
  'title.change_fiscal_start_month_format': 'Cambiar mes de inicio (Actualmente: empieza en {0})',
  'csv.preset': 'Configuraciones predeterminadas',
  'csv.preset_save': 'Guardar configuración',
  'csv.preset_default': '-- Detectar columnas automáticamente --',
  'prompt.preset_name':
    'Introduzca un nombre para este ajuste preestablecido de CSV (ej. Amex, PayPal):',
  'confirm.delete_preset': '¿Eliminar ajuste preestablecido "{0}"?',
  'alert.preset_name_required': 'El nombre del ajuste preestablecido es obligatorio.',
  'toast.preset_saved': 'Ajuste preestablecido "{0}" guardado correctamente.',
  'toast.preset_deleted': 'Ajuste preestablecido "{0}" eliminado.',
  'confirm.delete_custom_account': '¿Eliminar "{0}" del diccionario por completo?',
  'alert.invalid_amount_or_formula': 'La cantidad o fórmula introducida no es válida.',
  'alert.invalid_date': 'Esta fecha no existe. Compruebe el calendario.',
  'alert.invalid_date_format': 'Formato de fecha no válido (ej. 31/12 o 2026-12-31)',
  'toast.future_date': 'Se ha introducido una fecha futura.',
  'alert.csv_too_large':
    'El tamaño del archivo es demasiado grande (límite de 5 MB). La carga se canceló para evitar que el navegador se bloquee.',
  'alert.file_load_fail_memory':
    'Error al cargar el archivo. El archivo puede estar dañado o la memoria es insuficiente.',
  'alert.memo_and_amount_required': 'Las columnas "Descripción" y "Cantidad" son obligatorias.',
  'alert.duplicate_columns_mapped':
    'La misma columna está asignada a múltiples campos.\nPor favor, revise sus asignaciones de columnas.',
  'alert.too_many_import_rows':
    '⚠️ Demasiadas filas de datos ({0} filas).\nPara evitar que el navegador se congele, solo se importarán las primeras {1} filas.\nPor favor, divida el archivo CSV e inténtelo de nuevo con el resto.',
  'alert.db_engine_starting':
    'El motor de la base de datos se está iniciando. Por favor, espere unos segundos e inténtelo de nuevo.',
  'alert.file_too_large':
    'El tamaño del archivo es demasiado grande (límite de 50 MB). El archivo puede no ser válido.',
  'toast.file_loaded': 'Archivo "{0}" cargado',
  'alert.file_load_fail': 'Error al cargar el archivo.',
  'alert.no_export_data': 'No hay datos para exportar.',
  'alert.unsupported_file_type':
    'Tipo de archivo no soportado. Por favor, suelte un archivo de tipo .cash, .grind o .csv.',
  'export.generic_headers':
    '"ID","Fecha","Cuenta","Cantidad","Moneda","Tasa de impuestos","Descripción","Nombre del bloque"',
  'prompt.ai_template':
    'Eres un excelente asistente de conversión de datos.\nAnaliza el "sample CSV de un software de contabilidad desconocido" que te presentaré, e indícame la "asignación de columnas" para importarlo a GrindCash (una aplicación de gestión de efectivo).\n\nLos cuatro campos de datos requeridos por GrindCash para la importación son:\n- Fecha\n- Cuenta (Opcional)\n- Descripción\n- Cantidad\n\nPegaré el sample CSV a continuación. Por favor, analízalo e indícame qué columna (indexada desde 1, desde la izquierda) corresponde a cada uno de los cuatro campos anteriores.\n\n[Pega tu sample CSV aquí]',
  'markdown.title': '## Datos exportados (Markdown)\n\n',

  // password / security flow:
  'prompt.pw_backup':
    'Los datos de la copia de seguridad están cifrados. Introduzca la contraseña de descifrado:',
  'prompt.pw_new':
    '🔒 Establecer (o cambiar) contraseña.\nIntroduzca la misma contraseña de nuevo para confirmar:',
  'alert.cancel_startup_desc': 'El inicio se canceló. Por favor, recargue.',
  'error.security_stop_desc': 'Detenido por seguridad.<br>Por favor, recargue.',

  // record / template:
  'confirm.delete_record': '¿Eliminar este registro?',
  'error.tpl_load': 'Error al cargar los datos de la plantilla.',
  'error.tpl_corrupted': 'Los datos de la plantilla están dañados.',
  'toast.downloaded': 'Descargado "{0}"',

  // welcome / empty state:
  'welcome.title': 'Bienvenido a GrindCash',
  'welcome.desc':
    'Arrastre y suelte un archivo .cash, o<br>cree su primer bloque desde el campo de entrada de arriba.',
  'welcome.new_block': 'Crear nuevo bloque',
  'welcome.import_csv': 'Importar CSV',
  'welcome.browser_ok': 'Navegador recomendado (Chrome / Edge)',
  'welcome.fsa_enabled': 'La sobrescritura directa de archivos (File System API) está activada',
  'welcome.browser_warn': '⚠️ Navegador recomendado: Chrome o Edge',
  'welcome.fsa_disabled':
    'Su navegador actual no admite la sobrescritura directa de archivos. Cada guardado iniciará una descarga.',
  'filter_empty.title': 'Sin registros coincidentes',
  'filter_empty.desc':
    'No existen datos para el período seleccionado (filtro).<br>Intente cambiar el filtro y busque de nuevo.',
  'filter_empty.show_all': 'Mostrar todos los períodos',
  'alert.cell_too_long':
    'La longitud de la celda supera el límite de 10.000 caracteres. El archivo CSV puede no ser válido.',
  'alert.unclosed_quote': 'Se detectó una comilla sin cerrar. El archivo CSV puede no ser válido.',
  'label.do_not_select': '-- No seleccionar --',
  'label.column_num': 'Columna {0}',
  'csv.decode_fail':
    'Error al decodificar con la codificación "{0}". El archivo puede estar dañado o la codificación especificada es incorrecta.',

  'export.opt_generic': 'CSV genérico',
  'export.opt_xero': 'Xero',
  'export.opt_qb': 'QuickBooks Online',

  // period dropdown labels (for dynamic generation)
  'label.filter_by_year': '--- Filtrar por año ---',
  'label.filter_by_month': '--- Filtrar por mes ---',

  'cmd.split_stripe': 'Dividir comisión de Stripe (2.9% + $0.30) en fila activa',
  'cmd.split_paypal': 'Dividir comisión de PayPal (3.49% + $0.49) en fila activa',
  'cmd.privacy_mode': 'Alternar modo de privacidad (Ocultar números)',
  'error.record_locked':
    'No se puede modificar. Este bloque contiene registros exportados y bloqueados.',
  'alert.drop_while_saving': 'No se puede abrir el archivo mientras se guarda.',
  'error.csv_invalid_date': 'Formato de fecha no válido detectado en la fila {0}: "{1}"',
  'error.csv_abort': 'Importación abortada para evitar la corrupción de datos.',
  'error.split_locked':
    'No se puede aplicar la división de comisiones en un registro que ya ha sido exportado y bloqueado.',
};
