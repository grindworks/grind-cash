export default {
  'app.title': 'GrindCash',
  'toc.filter': 'Filtra indice...',
  'title.current_file': 'File attualmente aperto',
  'filename.unsaved': 'NonSalvato.cash',
  'btn.install': '↓ Installa applicazione',
  'dict.select': 'Seleziona dizionario',
  'dict.select_title': 'Seleziona un dizionario per i suggerimenti automatici',
  'dict.custom': 'Diz: Personalizzato',
  'dict.none': 'Suggerimenti: Disattivati',
  'dict.general': 'Diz: Affari generali',

  'placeholder.password': 'Password di crittografia...',
  'title.password_help':
    "L'inserimento di una password crittograferà fortemente il file al salvataggio.",
  'title.toggle_password': 'Attiva/disattiva visibilità password',
  'btn.open': 'Apri',
  'btn.save': 'Salva',
  'title.cmd': 'Apri tavolozza dei comandi',
  'status.loading': 'Avvio del motore SQLite...',
  'filter.all': 'Tutti i periodi',
  'period.all': 'Tutti i periodi',
  'period.jan_mar': 'Gen-Mar',
  'period.apr_jun': 'Apr-Giu',
  'period.jul_sep': 'Lug-Set',
  'period.oct_dec': 'Ott-Dic',
  'period.this_year': 'Questo anno (Gen-Dic)',
  'period.prev_fiscal_year': 'Anno fiscale precedente',
  'period.this_fiscal_year': 'Anno fiscale corrente',
  'title.change_fiscal_start_month': "Modifica il mese di inizio dell'anno fiscale",
  'placeholder.new_block': 'Crea nuovo blocco (es. Viaggio di lavoro maggio 2026)...',
  'btn.expand_all': 'Espandi tutto',
  'btn.collapse_all': 'Comprimi tutto',
  'error.fatal': "Avvio dell'applicazione non riuscito",
  'error.fatal_desc':
    'Impossibile caricare i file richiesti.<br />Verificare la connessione di rete e ricaricare la pagina.',
  'btn.reload': 'Ricarica pagina',
  'csv.title': 'Impostazioni di importazione CSV',
  'csv.desc': 'Assegna le colonne CSV ai campi GrindCash.',
  'csv.date': 'Colonna data',
  'csv.optional': '(Opzionale)',
  'csv.account': 'Colonna conto',
  'csv.memo': 'Colonna descrizione',
  'csv.amount': 'Colonna importo',
  'csv.preview': 'Anteprima dei dati (Prime righe)',
  'csv.skip_first': 'Salta le prime',
  'csv.skip_rows': 'righe',
  'csv.encoding': 'Codifica:',
  'btn.cancel': 'Annulla',
  'btn.import': 'Importa',
  'export.title': 'Esportazione CSV',
  'export.desc': "Seleziona il formato del software di contabilità per l'esportazione.",
  'export.format': 'Formato di output',
  'btn.export': 'Esporta',
  'dict_edit.title': 'Modifica dizionario personalizzato',
  'dict_edit.desc':
    "Registra e riordina i conti utilizzati di frequente.<br />Fai clic sull'icona dell'occhio per nascondere dai suggerimenti.",
  'btn.show_all': 'Mostra tutto',
  'btn.hide_all': 'Nascondi tutto',
  'placeholder.new_account': 'Aggiungi nuovo conto',
  'btn.add': 'Aggiungi',
  'btn.save_close': 'Salva e chiudi',
  'prompt.pw_title': 'Inserisci password',
  'prompt.pw_desc': 'Il file è crittografato. Inserisci la password per decrittografare:',
  'btn.ok': 'OK',
  'prompt.ios_install_btn': 'Aggiungi alla schermata Home',
  'drop.title': 'Trascina il file .cash qui per aprirlo',
  'drop.desc1': 'Puoi anche sovrascrivere e salvare direttamente.',
  'drop.desc2': '* Fai clic in un punto qualsiasi per chiudere questa schermata.',
  'cmd.search': 'Ricerca comandi',
  'cmd.placeholder': 'Digita un comando o cerca...',

  // main.js inside strings:
  'toast.restored': 'Dati non salvati ripristinati',
  'toast.saved': 'I dati sono stati salvati',
  'toast.copied': 'Copiato negli appunti',
  'alert.restore_fail':
    '⚠️ Ripristino non riuscito perché i dati di backup precedenti sono corrotti.',
  'confirm.discard_changes': 'Hai modifiche non salvate. Eliminarle e aprire un altro file?',
  'confirm.pw_empty':
    '⚠️ AVVERTENZA ⚠️\nLa password è vuota.\nSalvare ora rimuoverà la crittografia e salverà in testo normale.\n\nSei sicuro di voler rimuovere la crittografia?',
  'alert.pw_empty_canceled': 'Salvataggio annullato. Imposta una password.',
  'alert.pw_mismatch': '❌ Le password non corrispondono. Salvataggio annullato.',
  'alert.write_permission_fail':
    'Impossibile ottenere l\'autorizzazione di scrittura. Il browser potrebbe averla revocata.\n\nProva "Salva come".',
  'toast.saved_to': 'Dati salvati in "{0}"',
  'toast.save_error':
    'Errore: Impossibile salvare il file. Controlla lo spazio su disco e le autorizzazioni.',
  'alert.multi_tab':
    "⚠️ GrindCash è già aperto in un'altra scheda o finestra.\n\nPer evitare conflitti di dati, non modificare in questa scheda.",
  'alert.http_desc':
    '⚠️ AVVISO DI SICUREZZA ⚠️\n\nNell\'attuale ambiente di accesso (HTTP), la lettura/scrittura dei file e la crittografia sono bloccate dalle restrizioni di sicurezza del browser.\n\nPer eseguire GrindCash normalmente, caricalo su un ambiente "HTTPS" o eseguilo su "localhost".',
  'error.http_required': 'Errore: È richiesto un ambiente HTTPS o localhost',

  // templates
  'prompt.save_tpl_title': 'Salva questo blocco come modello.\nInserisci il nome del modello:',
  'toast.tpl_saved':
    '✅ Modello "{0}" salvato.\nPuoi richiamarlo in qualsiasi momento dalla tavolozza dei comandi (Cmd+K).',
  'confirm.delete_tpl': 'Eliminare il modello "{0}"?',
  'cmd.insert': '[Inserisci] {0}',
  'cmd.delete': '[Elimina] {0}',

  // command titles:
  'cmd.save_title': 'Salva dati (Salva)',
  'cmd.open_title': 'Apri file (Apri)',
  'cmd.saveas_title': 'Salva come copia (Salva come)',
  'cmd.new_title': 'Crea nuovo blocco (Nuovo)',
  'export.unexported_only': 'Esporta solo record non esportati (segna come esportati dopo)',
  'cmd.import_title': 'Importa CSV (Importa CSV)',
  'cmd.export_title': 'Esporta CSV (Esporta CSV)',
  'cmd.editdict_title': 'Modifica dizionario dei conti personalizzato',
  'cmd.ai_title': 'Copia prompt di formattazione IA (IA)',
  'cmd.markdown_title': 'Copia elenco come Markdown (per GrindSite)',
  'cmd.expandall_title': 'Espandi tutti i blocchi',
  'cmd.collapseall_title': 'Comprimi tutti i blocchi',
  'cmd.calc_copied': 'Copiato {0}',
  'cmd.calc_inserted': 'Inserito {0} direttamente',

  // index.html/main.js logic labels
  'label.grand_total': 'Importo totale',
  'label.period_info_all': '💡 Esportazione dei dati attualmente per <b>tutti i periodi</b>.',
  'label.period_info_filtered': '💡 Esportazione dei dati attualmente per <b>"{0}"</b>.',
  'label.empty_blocks': 'Nessun dato di transazione.',
  'label.period': 'Periodo',
  'label.tag_modal_title': '{0} ({1} elementi)',
  'label.no_date': 'Senza data',
  'label.unclassified': 'Non classificato',
  'label.unnamed': 'Senza nome',
  'label.undecided': 'Indeciso',
  'toast.no_copy_data': 'Nessun dato da copiare.',
  'toast.md_copied': 'Copiato come Markdown',
  'toast.import_success': 'Importati {0} elementi',
  'toast.import_skip': ' ({0} ignorati a causa di un importo non valido)',
  'error.import_fail': "Si è verificato un errore durante l'importazione.",
  'toast.filter_outside':
    'Periodo reimpostato su "Tutti" perché la data aggiunta era al di fuori del filtro corrente.',
  'tooltip.edit_date': 'Fai clic per modificare la data (Supporta AAAA/MM/GG)',

  // custom dict editor:
  'dict_edit.show': 'Mostra',
  'dict_edit.hide': 'Nascondi',
  'dict_edit.delete_title': 'Elimina completamente',

  // fiscal year start month change:
  'prompt.fiscal_month': "Inserisci il mese di inizio dell'anno fiscale (1-12):",
  'alert.invalid_fiscal_month': 'Inserisci un numero compreso tra 1 e 12.',
  'confirm.sort_by_date':
    'Ordinare gli elementi in questo blocco dal "più vecchio al più recente"?\n(Gli elementi con la stessa data mantengono l\'ordine originale)',
  'confirm.restore_draft':
    'Sono stati trovati dati di backup non salvati della sessione precedente.\n\nRipristinarli?\n(Selezionando Annulla il backup verrà eliminato)',
  'toast.prompt_copied': 'Prompt IA copiato',
  'toast.sorted': 'Ordinato per data',
  'toast.settlement_created': 'Record di liquidazione creato.',
  'toast.split_applied': 'Suddivisione applicata: Lordo {0} e Commissione {1}',
  'toast.split_added': 'Aggiunto Lordo ({0}) e {1} ({2})',
  'error.split_no_focus':
    'Fai clic o posizionati prima su un campo Importo per applicare la suddivisione delle commissioni.',
  'error.split_no_amount': 'Inserisci prima un importo.',
  'error.split_invalid': "Valore dell'importo non valido.",
  'toast.privacy_toggled': 'Modalità privacy attivata/disattivata',
  'toast.app_updated_reload':
    'App aggiornata. <a href="#" id="toast-reload-btn" class="ml-2 font-bold underline cursor-pointer">Ricarica per applicare</a>',
  'toast.sqlite_loaded': 'Motore SQLite avviato correttamente',
  'toast.sqlite_load_fail': 'Errore: Avvio del motore SQLite non riuscito',
  'placeholder.account': 'Conto',
  'dict_edit.add_label': 'Aggiungi nuovo conto',
  'title.change_fiscal_start_month_format':
    'Modifica il mese di inizio (Attualmente: inizia a {0})',
  'csv.preset': 'Configurazioni predefinite',
  'csv.preset_save': 'Salva configurazione',
  'csv.preset_default': '-- Rileva colonne automaticamente --',
  'prompt.preset_name': 'Inserisci un nome per questo preset CSV (es. Amex, PayPal):',
  'confirm.delete_preset': 'Eliminare il preset "{0}"?',
  'alert.preset_name_required': 'Il nome del preset è obbligatorio.',
  'toast.preset_saved': 'Preset "{0}" salvato correttamente.',
  'toast.preset_deleted': 'Preset "{0}" eliminato.',
  'confirm.delete_custom_account': 'Eliminare "{0}" completamente dal dizionario?',
  'alert.invalid_amount_or_formula': "L'importo o la formula inseriti non sono validi.",
  'alert.invalid_date': 'Questa data non esiste. Controlla il calendario.',
  'alert.invalid_date_format': 'Formato data non valido (es. 31/12 o 2026-12-31)',
  'toast.future_date': 'È stata inserita una data futura.',
  'alert.csv_too_large':
    'Il file è troppo grande (limite di 5 MB). Il caricamento è stato annullato per evitare il blocco del browser.',
  'alert.file_load_fail_memory':
    'Impossibile caricare il file. Il file potrebbe essere corrotto o la memoria potrebbe essere insufficiente.',
  'alert.memo_and_amount_required': 'Le colonne "Descrizione" e "Importo" sono obbligatorie.',
  'alert.duplicate_columns_mapped':
    'La stessa colonna è mappata su più campi.\nVerifica le mappature delle colonne.',
  'alert.too_many_import_rows':
    '⚠️ Troppe righe di dati ({0} righe).\nPer evitare il congelamento del browser, verranno importate solo le prime {1} righe.\nDividi il file CSV e riprova con la parte rimanente.',
  'alert.db_engine_starting':
    'Il motore del database si sta avviando. Attendi qualche secondo e riprova.',
  'alert.file_too_large':
    'Il file è troppo grande (limite di 50 MB). Il file potrebbe non essere valido.',
  'toast.file_loaded': 'File "{0}" caricato',
  'alert.file_load_fail': 'Impossibile caricare il file.',
  'alert.no_export_data': 'Nessun dato da esportare.',
  'alert.unsupported_file_type':
    'Tipo di file non supportato. Trascina un file di tipo .cash, .grind o .csv.',
  'export.generic_headers':
    '"ID","Data","Conto","Importo","Valuta","Aliquota fiscale","Descrizione","Nome blocco"',
  'prompt.ai_template':
    'Sei un eccellente assistente per la conversione dei dati.\nAnalizza il "sample CSV di un software di contabilità sconosciuto" che ti presenterò e indicami la "mappatura delle colonne" per importarlo in GrindCash (un\'applicazione per la gestione della cassa).\n\nI quattro campi dati richiesti da GrindCash per l\'importazione sono:\n- Data\n- Conto (Opzionale)\n- Descrizione\n- Importo\n\nIncollerò il sample CSV qui sotto. Analizzalo e indicami quale colonna (indicizzata a partire da 1, da sinistra) corrisponde a ciascuno dei quattro campi sopra descritti.\n\n[Incolla qui il tuo sample CSV]',
  'markdown.title': '## Dati esportati (Markdown)\n\n',

  // password / security flow:
  'prompt.pw_backup':
    'I dati di backup sono crittografati. Inserisci la password di decrittografia:',
  'prompt.pw_new':
    '🔒 Imposta (o modifica) la password.\nInserisci nuovamente la stessa password per confermare:',
  'alert.cancel_startup_desc': "L'avvio è stato annullato. Ricarica la pagina.",
  'error.security_stop_desc': 'Interrotto per sicurezza.<br>Ricarica la pagina.',

  // record / template:
  'confirm.delete_record': 'Eliminare questo record?',
  'error.tpl_load': 'Impossibile caricare i dati del modello.',
  'error.tpl_corrupted': 'I dati del modello sono corrotti.',
  'toast.downloaded': 'Scaricato "{0}"',

  // welcome / empty state:
  'welcome.title': 'Benvenuto in GrindCash',
  'welcome.desc':
    'Trascina e rilascia un file .cash, o<br>crea il tuo primo blocco dal campo di input qui sopra.',
  'welcome.new_block': 'Crea nuovo blocco',
  'welcome.import_csv': 'Importa CSV',
  'welcome.browser_ok': 'Browser consigliato (Chrome / Edge)',
  'welcome.fsa_enabled': 'La sovrascrittura diretta del file (File System API) è abilitata',
  'welcome.browser_warn': '⚠️ Browser consigliato: Chrome o Edge',
  'welcome.fsa_disabled':
    'Il tuo browser attuale non supporta la sovrascrittura diretta del file. Ogni salvataggio avvierà un download.',
  'filter_empty.title': 'Nessun record corrispondente',
  'filter_empty.desc':
    'Non esistono dati per il periodo selezionato (filtro).<br>Prova a cambiare il filtro e cerca di nuovo.',
  'filter_empty.show_all': 'Mostra tutti i periodi',
  'alert.cell_too_long':
    'La lunghezza della cella supera il limite di 10.000 caratteri. Il file CSV potrebbe non essere valido.',
  'alert.unclosed_quote': 'Rilevate virgolette non chiuse. Il file CSV potrebbe non essere valido.',
  'label.do_not_select': '-- Non selezionare --',
  'label.column_num': 'Colonna {0}',
  'csv.decode_fail':
    'Impossibile decodificare con la codifica "{0}". Il file potrebbe essere corrotto o la codifica specificata è errata.',

  'export.opt_generic': 'CSV generico',
  'export.opt_xero': 'Xero',
  'export.opt_qb': 'QuickBooks Online',

  // period dropdown labels (for dynamic generation)
  'label.filter_by_year': '--- Filtra per anno ---',
  'label.filter_by_month': '--- Filtra per mese ---',

  'cmd.split_stripe': 'Suddividi commissione Stripe (2.9% + $0.30) sulla riga attiva',
  'cmd.split_paypal': 'Suddividi commissione PayPal (3.49% + $0.49) sulla riga attiva',
  'cmd.privacy_mode': 'Attiva/disattiva modalità privacy (Nascondi numeri)',
  'error.record_locked':
    'Impossibile modificare. Questo blocco contiene record esportati e bloccati.',
  'alert.drop_while_saving': 'Impossibile aprire il file durante il salvataggio.',
  'error.csv_invalid_date': 'Formato data non valido rilevato alla riga {0}: "{1}"',
  'error.csv_abort': 'Importazione interrotta per evitare la corruzione dei dati.',
  'error.split_locked':
    'Impossibile applicare la suddivisione delle commissioni su un record già esportato e bloccato.',
};
