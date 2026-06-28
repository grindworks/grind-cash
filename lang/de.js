export default {
  'app.title': 'GrindCash',
  'toc.filter': 'Index filtern...',
  'title.current_file': 'Aktuell geöffnete Datei',
  'filename.unsaved': 'Ungespeichert.cash',
  'btn.install': '↓ App installieren',
  'dict.select': 'Wörterbuch auswählen',
  'dict.select_title': 'Wörterbuch für automatische Vorschläge auswählen',
  'dict.custom': 'Wb: Benutzerdefiniert',
  'dict.none': 'Vorschlag: Aus',
  'dict.general': 'Wb: Allgemeine Geschäfte',

  'placeholder.password': 'Verschlüsselungskennwort...',
  'title.password_help':
    'Die Eingabe eines Passworts verschlüsselt die Datei beim Speichern stark.',
  'title.toggle_password': 'Passwort-Sichtbarkeit umschalten',
  'btn.open': 'Öffnen',
  'btn.save': 'Speichern',
  'title.cmd': 'Befehlspalette öffnen',
  'status.loading': 'SQLite-Engine wird gestartet...',
  'filter.all': 'Alle Zeiträume',
  'period.all': 'Alle Zeiträume',
  'period.jan_mar': 'Jan-Mär',
  'period.apr_jun': 'Apr-Jun',
  'period.jul_sep': 'Jul-Sep',
  'period.oct_dec': 'Okt-Dez',
  'period.this_year': 'Dieses Jahr (Jan-Dez)',
  'period.prev_fiscal_year': 'Vorheriges Geschäftsjahr',
  'period.this_fiscal_year': 'Aktuelles Geschäftsjahr',
  'title.change_fiscal_start_month': 'Geschäftsjahres-Startmonat ändern',
  'placeholder.new_block': 'Neuen Block erstellen (z. B. Geschäftsreise Mai 2026) ...',
  'btn.expand_all': 'Alle ausklappen',
  'btn.collapse_all': 'Alle einklappen',
  'error.fatal': 'Anwendung konnte nicht gestartet werden',
  'error.fatal_desc':
    'Erforderliche Dateien konnten nicht geladen werden.<br />Bitte überprüfen Sie Ihr Netzwerk und laden Sie die Seite neu.',
  'btn.reload': 'Seite neu laden',
  'csv.title': 'CSV-Importeinstellungen',
  'csv.desc': 'Weisen Sie CSV-Spalten den GrindCash-Feldern zu.',
  'csv.date': 'Datumsspalte',
  'csv.optional': '(Optional)',
  'csv.account': 'Kontospalte',
  'csv.memo': 'Notizspalte',
  'csv.amount': 'Betragsspalte',
  'csv.preview': 'Datenvorschau (Erste Zeilen)',
  'csv.skip_first': 'Überspringe erste',
  'csv.skip_rows': 'Zeilen',
  'csv.encoding': 'Codierung:',
  'btn.cancel': 'Abbrechen',
  'btn.import': 'Importieren',
  'export.title': 'CSV-Export',
  'export.desc': 'Wählen Sie das Format der Buchhaltungssoftware für die Ausgabe.',
  'export.format': 'Ausgabeformat',
  'btn.export': 'Exportieren',
  'dict_edit.title': 'Benutzerdefiniertes Wörterbuch bearbeiten',
  'dict_edit.desc':
    'Registrieren und sortieren Sie häufig verwendete Konten.<br />Klicken Sie auf das Augensymbol, um sie in den Vorschlägen auszublenden.',
  'btn.show_all': 'Alle anzeigen',
  'btn.hide_all': 'Alle ausblenden',
  'placeholder.new_account': 'Neues Konto hinzufügen',
  'btn.add': 'Hinzufügen',
  'btn.save_close': 'Speichern & Schließen',
  'prompt.pw_title': 'Passwort eingeben',
  'prompt.pw_desc': 'Datei ist verschlüsselt. Bitte Passwort zur Entschlüsselung eingeben:',
  'btn.ok': 'OK',
  'prompt.ios_install_btn': 'Zum Startbildschirm hinzufügen',
  'drop.title': '.cash-Datei hierher ziehen, um sie zu öffnen',
  'drop.desc1': 'Sie können sie auch direkt überschreiben und speichern.',
  'drop.desc2': '* Klicken Sie irgendwohin, um diesen Bildschirm zu schließen.',
  'cmd.search': 'Befehlssuche',
  'cmd.placeholder': 'Befehl eingeben oder suchen...',

  // main.js inside strings:
  'toast.restored': 'Ungespeicherte Daten wiederhergestellt',
  'toast.saved': 'Daten wurden gespeichert',
  'toast.copied': 'In Zwischenablage kopiert',
  'alert.restore_fail':
    '⚠️ Wiederherstellung fehlgeschlagen, da das vorherige Backup beschädigt ist.',
  'confirm.discard_changes':
    'Sie haben ungespeicherte Änderungen. Verwerfen und andere Datei öffnen?',
  'confirm.pw_empty':
    '⚠️ WARNUNG ⚠️\nPasswort ist leer.\nWenn Sie jetzt speichern, wird die Verschlüsselung aufgehoben und die Datei im Klartext gespeichert.\n\nSind Sie sicher, dass Sie die Verschlüsselung aufheben möchten?',
  'alert.pw_empty_canceled': 'Speichern abgebrochen. Bitte legen Sie ein Passwort fest.',
  'alert.pw_mismatch': '❌ Passwörter stimmen nicht überein. Speichern abgebrochen.',
  'alert.write_permission_fail':
    'Schreibberechtigung konnte nicht eingeholt werden. Der Browser hat sie möglicherweise widerrufen.\n\nBitte versuchen Sie "Speichern unter".',
  'toast.saved_to': 'Daten unter "{0}" gespeichert',
  'toast.save_error':
    'Fehler: Speichern fehlgeschlagen. Überprüfen Sie Speicherplatz und Berechtigungen.',
  'alert.multi_tab':
    '⚠️ GrindCash ist bereits in einem anderen Tab oder Fenster geöffnet.\n\nUm Datenkonflikte zu vermeiden, bearbeiten Sie die Daten bitte nicht in diesem Tab.',
  'alert.http_desc':
    '⚠️ SICHERHEITSWARNUNG ⚠️\n\nIn der aktuellen Zugriffsumgebung (HTTP) sind das Lesen/Schreiben von Dateien und die Verschlüsselung aufgrund von Sicherheitsbeschränkungen des Browsers blockiert.\n\nUm GrindCash normal auszuführen, laden Sie es in eine "HTTPS"-Umgebung hoch oder führen Sie es auf "localhost" aus.',
  'error.http_required': 'Fehler: HTTPS-Umgebung oder localhost erforderlich',

  // templates
  'prompt.save_tpl_title': 'Diesen Block als Vorlage speichern.\nVorlagennamen eingeben:',
  'toast.tpl_saved':
    '✅ Vorlage "{0}" gespeichert.\nSie können sie jederzeit über die Befehlspalette (Cmd+K) aufrufen.',
  'confirm.delete_tpl': 'Vorlage "{0}" löschen?',
  'cmd.insert': '[Einfügen] {0}',
  'cmd.delete': '[Löschen] {0}',

  // command titles:
  'cmd.save_title': 'Daten speichern (Speichern)',
  'cmd.open_title': 'Datei öffnen (Öffnen)',
  'cmd.saveas_title': 'Als Kopie speichern (Speichern unter)',
  'cmd.new_title': 'Neuen Block erstellen (Neu)',
  'export.unexported_only':
    'Nur nicht exportierte Datensätze exportieren (danach als exportiert markieren)',
  'cmd.import_title': 'CSV importieren (CSV-Import)',
  'cmd.export_title': 'CSV exportieren (CSV-Export)',
  'cmd.editdict_title': 'Benutzerdefiniertes Kontowörterbuch bearbeiten',
  'cmd.ai_title': 'AI-Formatierungs-Prompt kopieren (AI)',
  'cmd.markdown_title': 'Liste als Markdown kopieren (für GrindSite)',
  'cmd.expandall_title': 'Alle Blöcke ausklappen',
  'cmd.collapseall_title': 'Alle Blöcke einklappen',
  'cmd.calc_copied': '{0} kopiert',
  'cmd.calc_inserted': '{0} direkt eingefügt',

  // index.html/main.js logic labels
  'label.grand_total': 'Gesamtbetrag',
  'label.period_info_all': '💡 Daten werden derzeit für <b>alle Zeiträume</b> exportiert.',
  'label.period_info_filtered': '💡 Daten werden derzeit für <b>"{0}"</b> exportiert.',
  'label.empty_blocks': 'Keine Transaktionsdaten.',
  'label.period': 'Zeitraum',
  'label.tag_modal_title': '{0} ({1} Einträge)',
  'label.no_date': 'Kein Datum',
  'label.unclassified': 'Nicht klassifiziert',
  'label.unnamed': 'Unbenannt',
  'label.undecided': 'Unentschieden',
  'toast.no_copy_data': 'Keine Daten zum Kopieren.',
  'toast.md_copied': 'Als Markdown kopiert',
  'toast.import_success': '{0} Einträge importiert',
  'toast.import_skip': ' ({0} wegen ungültigen Betrags übersprungen)',
  'error.import_fail': 'Beim Importieren ist ein Fehler aufgetreten.',
  'toast.filter_outside':
    'Zeitraum auf "Alle" zurückgesetzt, da das hinzugefügte Datum außerhalb des aktuellen Filters lag.',
  'tooltip.edit_date': 'Klicken, um das Datum zu bearbeiten (Unterstützt JJJJ/MM/TT)',

  // custom dict editor:
  'dict_edit.show': 'Anzeigen',
  'dict_edit.hide': 'Ausblenden',
  'dict_edit.delete_title': 'Vollständig löschen',

  // fiscal year start month change:
  'prompt.fiscal_month': 'Geben Sie den Startmonat des Geschäftsjahres ein (1-12):',
  'alert.invalid_fiscal_month': 'Bitte geben Sie eine Zahl zwischen 1 und 12 ein.',
  'confirm.sort_by_date':
    'Einträge in diesem Block nach "älteste zuerst" sortieren?\n(Einträge mit demselben Datum behalten ihre ursprüngliche Reihenfolge bei)',
  'confirm.restore_draft':
    'Ungespeicherte Backup-Daten aus Ihrer letzten Sitzung wurden gefunden.\n\nWiederherstellen?\n(Abbrechen verwirft das Backup)',
  'toast.prompt_copied': 'AI-Prompt kopiert',
  'toast.sorted': 'Nach Datum sortiert',
  'toast.settlement_created': 'Abrechnungsdatensatz erstellt.',
  'toast.split_applied': 'Aufteilung angewendet: Brutto {0} & Gebühr {1}',
  'toast.split_added': 'Brutto ({0}) & {1} ({2}) hinzugefügt',
  'error.split_no_focus':
    'Bitte klicken oder fokussieren Sie zuerst auf ein Betragsfeld, um die Gebührenaufteilung anzuwenden.',
  'error.split_no_amount': 'Bitte geben Sie zuerst einen Betrag ein.',
  'error.split_invalid': 'Ungültiger Betragswert.',
  'toast.privacy_toggled': 'Privatsphärenmodus umgeschaltet',
  'toast.app_updated_reload':
    'App aktualisiert. <a href="#" id="toast-reload-btn" class="ml-2 font-bold underline cursor-pointer">Neu laden, um anzuwenden</a>',
  'toast.sqlite_loaded': 'SQLite-Engine erfolgreich gestartet',
  'toast.sqlite_load_fail': 'Fehler: SQLite-Engine konnte nicht gestartet werden',
  'placeholder.account': 'Konto',
  'dict_edit.add_label': 'Neues Konto hinzufügen',
  'title.change_fiscal_start_month_format': 'Startmonat ändern (Aktuell: beginnt im {0})',
  'csv.preset': 'Voreingestellte Konfigurationen',
  'csv.preset_save': 'Konfiguration speichern',
  'csv.preset_default': '-- Spalten automatisch erkennen --',
  'prompt.preset_name': 'Geben Sie einen Namen für dieses CSV-Preset ein (z. B. Amex, PayPal):',
  'confirm.delete_preset': 'Preset "{0}" löschen?',
  'alert.preset_name_required': 'Name des Presets ist erforderlich.',
  'toast.preset_saved': 'Preset "{0}" erfolgreich gespeichert.',
  'toast.preset_deleted': 'Preset "{0}" gelöscht.',
  'confirm.delete_custom_account': '"{0}" vollständig aus dem Wörterbuch löschen?',
  'alert.invalid_amount_or_formula': 'Der eingegebene Betrag oder die Formel ist ungültig.',
  'alert.invalid_date': 'Dieses Datum existiert nicht. Bitte überprüfen Sie den Kalender.',
  'alert.invalid_date_format': 'Ungültiges Datumsformat (z. B. 31.12. oder 2026-12-31)',
  'toast.future_date': 'Es wurde ein zukünftiges Datum eingegeben.',
  'alert.csv_too_large':
    'Datei ist zu groß (Limit 5 MB). Der Ladevorgang wurde abgebrochen, um einen Browserabsturz zu verhindern.',
  'alert.file_load_fail_memory':
    'Datei konnte nicht geladen werden. Die Datei ist möglicherweise beschädigt oder der Arbeitsspeicher reicht nicht aus.',
  'alert.memo_and_amount_required': '"Notiz" und "Betrag" sind erforderliche Spalten.',
  'alert.duplicate_columns_mapped':
    'Dieselbe Spalte ist mehreren Feldern zugewiesen.\nBitte überprüfen Sie Ihre Spaltenzuordnungen.',
  'alert.too_many_import_rows':
    '⚠️ Zu viele Datenzeilen ({0} Zeilen).\nUm das Einfrieren des Browsers zu verhindern, werden nur die ersten {1} Zeilen importiert.\nBitte teilen Sie die CSV-Datei auf und versuchen Sie es für den Rest erneut.',
  'alert.db_engine_starting':
    'Datenbank-Engine wird gestartet. Bitte warten Sie einige Sekunden und versuchen Sie es erneut.',
  'alert.file_too_large': 'Datei ist zu groß (Limit 50 MB). Die Datei ist möglicherweise ungültig.',
  'toast.file_loaded': 'Datei "{0}" geladen',
  'alert.file_load_fail': 'Datei konnte nicht geladen werden.',
  'alert.no_export_data': 'Keine Daten zum Exportieren.',
  'alert.unsupported_file_type':
    'Nicht unterstützter Dateityp. Bitte ziehen Sie eine Datei vom Typ .cash, .grind oder .csv.',
  'export.generic_headers':
    '"ID","Datum","Konto","Betrag","Währung","Steuersatz","Notiz","Blockname"',
  'prompt.ai_template':
    'Sie sind ein hervorragender Datenkonvertierungs-Assistent.\nAnalysieren Sie die "Beispiel-CSV einer unbekannten Buchhaltungssoftware", die ich Ihnen präsentieren werde, und nennen Sie mir die "Spaltenzuordnung", um sie in GrindCash (eine Cash-Management-App) zu importieren.\n\nDie vier von GrindCash für den Import benötigten Datenfelder sind:\n- Datum\n- Konto (Optional)\n- Notiz / Beschreibung\n- Betrag\n\nIch werde die Beispiel-CSV unten einfügen. Bitte analysieren Sie sie und sagen Sie mir, welche Spalte (1-basiert, von links) jedem der vier oben genannten Felder entspricht.\n\n[Fügen Sie hier Ihre Beispiel-CSV ein]',
  'markdown.title': '## Exportierte Daten (Markdown)\n\n',

  // password / security flow:
  'prompt.pw_backup': 'Backup-Daten sind verschlüsselt. Entschlüsselungspasswort eingeben:',
  'prompt.pw_new':
    '🔒 Passwort festlegen (oder ändern).\nGeben Sie dasselbe Passwort zur Bestätigung erneut ein:',
  'alert.cancel_startup_desc': 'Start wurde abgebrochen. Bitte neu laden.',
  'error.security_stop_desc': 'Aus Sicherheitsgründen gestoppt.<br>Bitte neu laden.',

  // record / template:
  'confirm.delete_record': 'Diesen Eintrag löschen?',
  'error.tpl_load': 'Vorlagendaten konnten nicht geladen werden.',
  'error.tpl_corrupted': 'Vorlagendaten sind beschädigt.',
  'toast.downloaded': '"{0}" heruntergeladen',

  // welcome / empty state:
  'welcome.title': 'Willkommen bei GrindCash',
  'welcome.desc':
    'Ziehen Sie eine .cash-Datei hierher oder<br>erstellen Sie Ihren ersten Block über das Eingabefeld oben.',
  'welcome.new_block': 'Neuen Block erstellen',
  'welcome.import_csv': 'CSV importieren',
  'welcome.browser_ok': 'Empfohlener Browser (Chrome / Edge)',
  'welcome.fsa_enabled': 'Direktes Überschreiben von Dateien (File System API) ist aktiviert',
  'welcome.browser_warn': '⚠️ Empfohlener Browser: Chrome oder Edge',
  'welcome.fsa_disabled':
    'Ihr aktueller Browser unterstützt das direkte Überschreiben von Dateien nicht. Jedes Speichern löst einen Download aus.',
  'filter_empty.title': 'Keine passenden Datensätze',
  'filter_empty.desc':
    'Keine Daten für den ausgewählten Zeitraum (Filter) vorhanden.<br>Versuchen Sie, den Filter zu ändern und suchen Sie erneut.',
  'filter_empty.show_all': 'Alle Zeiträume anzeigen',
  'alert.cell_too_long':
    'Zellenlänge überschreitet das Limit von 10.000 Zeichen. Die CSV-Datei ist möglicherweise ungültig.',
  'alert.unclosed_quote':
    'Nicht geschlossenes Anführungszeichen erkannt. Die CSV-Datei ist möglicherweise ungültig.',
  'label.do_not_select': '-- Nicht auswählen --',
  'label.column_num': 'Spalte {0}',
  'csv.decode_fail':
    'Decodierung mit Codierung "{0}" fehlgeschlagen. Die Datei ist möglicherweise beschädigt oder die angegebene Codierung ist falsch.',

  'export.opt_generic': 'Generische CSV',
  'export.opt_xero': 'Xero',
  'export.opt_qb': 'QuickBooks Online',

  // period dropdown labels (for dynamic generation)
  'label.filter_by_year': '--- Nach Jahr filtern ---',
  'label.filter_by_month': '--- Nach Monat filtern ---',

  'cmd.split_stripe': 'Stripe-Gebühr (2.9% + $0.30) in aktiver Zeile aufteilen',
  'cmd.split_paypal': 'PayPal-Gebühr (3.49% + $0.49) in aktiver Zeile aufteilen',
  'cmd.privacy_mode': 'Privatsphärenmodus umschalten (Zahlen ausblenden)',
  'error.record_locked':
    'Änderung nicht möglich. Dieser Block enthält exportierte und gesperrte Datensätze.',
  'alert.drop_while_saving': 'Datei kann während des Speicherns nicht geöffnet werden.',
  'error.csv_invalid_date': 'Ungültiges Datumsformat in Zeile {0} erkannt: "{1}"',
  'error.csv_abort': 'Import abgebrochen, um Datenbeschädigung zu verhindern.',
  'error.split_locked':
    'Gebührenaufteilung kann nicht auf einen bereits exportierten und gesperrten Datensatz angewendet werden.',
};
