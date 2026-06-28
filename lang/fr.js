export default {
  'app.title': 'GrindCash',
  'toc.filter': "Filtrer l'index...",
  'title.current_file': 'Fichier actuellement ouvert',
  'filename.unsaved': 'NonSauvegarde.cash',
  'btn.install': "↓ Installer l'application",
  'dict.select': 'Sélectionner le dictionnaire',
  'dict.select_title': 'Sélectionner un dictionnaire pour les suggestions automatiques',
  'dict.custom': 'Dict : Personnalisé',
  'dict.none': 'Suggestions : Désactivées',
  'dict.general': 'Dict : Affaires générales',

  'placeholder.password': 'Mot de passe de chiffrement...',
  'title.password_help':
    "La saisie d'un mot de passe chiffrera fortement le fichier lors de l'enregistrement.",
  'title.toggle_password': 'Afficher/masquer le mot de passe',
  'btn.open': 'Ouvrir',
  'btn.save': 'Enregistrer',
  'title.cmd': 'Ouvrir la palette de commandes',
  'status.loading': 'Démarrage du moteur SQLite...',
  'filter.all': 'Toutes les périodes',
  'period.all': 'Toutes les périodes',
  'period.jan_mar': 'Jan-Mar',
  'period.apr_jun': 'Avr-Juin',
  'period.jul_sep': 'Juil-Sept',
  'period.oct_dec': 'Oct-Déc',
  'period.this_year': 'Cette année (Jan-Déc)',
  'period.prev_fiscal_year': 'Exercice précédent',
  'period.this_fiscal_year': 'Exercice en cours',
  'title.change_fiscal_start_month': "Modifier le mois de début de l'exercice",
  'placeholder.new_block': "Créer un nouveau bloc (ex. Voyage d'affaires mai 2026)...",
  'btn.expand_all': 'Tout développer',
  'btn.collapse_all': 'Tout réduire',
  'error.fatal': "Échec du démarrage de l'application",
  'error.fatal_desc':
    "Les fichiers requis n'ont pas pu être chargés.<br />Veuillez vérifier votre connexion réseau et recharger la page.",
  'btn.reload': 'Recharger la page',
  'csv.title': "Paramètres d'importation CSV",
  'csv.desc': 'Associer les colonnes CSV aux champs GrindCash.',
  'csv.date': 'Colonne Date',
  'csv.optional': '(Optionnel)',
  'csv.account': 'Colonne Compte',
  'csv.memo': 'Colonne Libellé',
  'csv.amount': 'Colonne Montant',
  'csv.preview': 'Aperçu des données (Premières lignes)',
  'csv.skip_first': 'Ignorer les',
  'csv.skip_rows': 'premières lignes',
  'csv.encoding': 'Encodage :',
  'btn.cancel': 'Annuler',
  'btn.import': 'Importer',
  'export.title': 'Export CSV',
  'export.desc': 'Sélectionner le format du logiciel de comptabilité pour la sortie.',
  'export.format': 'Format de sortie',
  'btn.export': 'Exporter',
  'dict_edit.title': 'Modifier le dictionnaire personnalisé',
  'dict_edit.desc':
    "Enregistrer et réorganiser les comptes fréquemment utilisés.<br />Cliquez sur l'icône de l'œil pour masquer des suggestions.",
  'btn.show_all': 'Tout afficher',
  'btn.hide_all': 'Tout masquer',
  'placeholder.new_account': 'Ajouter un nouveau compte',
  'btn.add': 'Ajouter',
  'btn.save_close': 'Enregistrer & Fermer',
  'prompt.pw_title': 'Saisir le mot de passe',
  'prompt.pw_desc': 'Le fichier est chiffré. Veuillez saisir le mot de passe pour le déchiffrer :',
  'btn.ok': 'OK',
  'prompt.ios_install_btn': "Ajouter à l'écran d'accueil",
  'drop.title': "Déposer le fichier .cash ici pour l'ouvrir",
  'drop.desc1': 'Vous pouvez également écraser et enregistrer directement.',
  'drop.desc2': "* Cliquez n'importe où pour fermer cet écran.",
  'cmd.search': 'Recherche de commandes',
  'cmd.placeholder': 'Saisissez une commande ou recherchez...',

  // main.js inside strings:
  'toast.restored': 'Données non enregistrées restaurées',
  'toast.saved': 'Les données ont été enregistrées',
  'toast.copied': 'Copié dans le presse-papiers',
  'alert.restore_fail':
    '⚠️ Échec de la restauration car les données de sauvegarde précédentes sont corrompues.',
  'confirm.discard_changes':
    'Vous avez des modifications non enregistrées. Les abandonner et ouvrir un autre fichier ?',
  'confirm.pw_empty':
    '⚠️ AVERTISSEMENT ⚠️\nLe mot de passe est vide.\nEnregistrer maintenant supprimera le chiffrement et enregistrera en texte brut.\n\nÊtes-vous sûr de vouloir supprimer le chiffrement ?',
  'alert.pw_empty_canceled': 'Enregistrement annulé. Veuillez définir un mot de passe.',
  'alert.pw_mismatch': '❌ Les mots de passe ne correspondent pas. Enregistrement annulé.',
  'alert.write_permission_fail':
    "Impossible d'obtenir l'autorisation d'écriture. Le navigateur l'a peut-être révoquée.\n\nVeuillez essayer \"Enregistrer sous\".",
  'toast.saved_to': 'Données enregistrées sous "{0}"',
  'toast.save_error':
    "Erreur : Échec de l'enregistrement du fichier. Vérifiez l'espace disque et les autorisations.",
  'alert.multi_tab':
    '⚠️ GrindCash est déjà ouvert dans un autre onglet ou une autre fenêtre.\n\nPour éviter les conflits de données, veuillez ne pas modifier dans cet onglet.',
  'alert.http_desc':
    '⚠️ AVERTISSEMENT DE SÉCURITÉ ⚠️\n\nDans l\'environnement d\'accès actuel (HTTP), la lecture/écriture de fichiers et le chiffrement sont bloqués par les restrictions de sécurité du navigateur.\n\nPour exécuter GrindCash normalement, téléchargez-le vers un environnement "HTTPS" ou lancez-le sur "localhost".',
  'error.http_required': 'Erreur : Environnement HTTPS ou localhost requis',

  // templates
  'prompt.save_tpl_title': 'Enregistrer ce bloc en tant que modèle.\nSaisir le nom du modèle :',
  'toast.tpl_saved':
    '✅ Modèle "{0}" enregistré.\nVous pouvez l\'appeler à tout moment depuis la palette de commandes (Cmd+K).',
  'confirm.delete_tpl': 'Supprimer le modèle "{0}" ?',
  'cmd.insert': '[Insérer] {0}',
  'cmd.delete': '[Supprimer] {0}',

  // command titles:
  'cmd.save_title': 'Enregistrer les données (Enregistrer)',
  'cmd.open_title': 'Ouvrir un fichier (Ouvrir)',
  'cmd.saveas_title': 'Enregistrer une copie (Enregistrer sous)',
  'cmd.new_title': 'Créer un nouveau bloc (Nouveau)',
  'export.unexported_only':
    'Exporter uniquement les enregistrements non exportés (marquer comme exportés après)',
  'cmd.import_title': 'Importer un CSV (Importer CSV)',
  'cmd.export_title': 'Exporter un CSV (Exporter CSV)',
  'cmd.editdict_title': 'Modifier le dictionnaire de comptes personnalisé',
  'cmd.ai_title': 'Copier le prompt de formatage IA (IA)',
  'cmd.markdown_title': 'Copier la liste au format Markdown (pour GrindSite)',
  'cmd.expandall_title': 'Développer tous les blocs',
  'cmd.collapseall_title': 'Réduire tous les blocs',
  'cmd.calc_copied': 'Copié {0}',
  'cmd.calc_inserted': '{0} inséré directement',

  // index.html/main.js logic labels
  'label.grand_total': 'Montant total',
  'label.period_info_all': '💡 Exportation des données pour <b>toutes les périodes</b>.',
  'label.period_info_filtered': '💡 Exportation des données pour <b>"{0}"</b>.',
  'label.empty_blocks': 'Aucune donnée de transaction.',
  'label.period': 'Période',
  'label.tag_modal_title': '{0} ({1} éléments)',
  'label.no_date': 'Sans date',
  'label.unclassified': 'Non classé',
  'label.unnamed': 'Sans nom',
  'label.undecided': 'Indécis',
  'toast.no_copy_data': 'Aucune donnée à copier.',
  'toast.md_copied': 'Copié au format Markdown',
  'toast.import_success': '{0} éléments importés',
  'toast.import_skip': " ({0} ignorés en raison d'un montant non valide)",
  'error.import_fail': "Une erreur est survenue lors de l'importation.",
  'toast.filter_outside':
    'Période réinitialisée à "Toutes" car la date ajoutée était en dehors du filtre actuel.',
  'tooltip.edit_date': 'Cliquez pour modifier la date (Prend en charge AAAA/MM/JJ)',

  // custom dict editor:
  'dict_edit.show': 'Afficher',
  'dict_edit.hide': 'Masquer',
  'dict_edit.delete_title': 'Supprimer complètement',

  // fiscal year start month change:
  'prompt.fiscal_month': "Saisir le mois de début de l'exercice (1-12) :",
  'alert.invalid_fiscal_month': 'Veuillez saisir un nombre entre 1 et 12.',
  'confirm.sort_by_date':
    'Trier les éléments de ce bloc du "plus ancien au plus récent" ?\n(Les éléments avec la même date conservent leur ordre d\'origine)',
  'confirm.restore_draft':
    'Des données de sauvegarde non enregistrées de votre dernière session ont été trouvées.\n\nLes restaurer ?\n(Sélectionner Annuler supprimera la sauvegarde)',
  'toast.prompt_copied': 'Prompt IA copié',
  'toast.sorted': 'Trié par date',
  'toast.settlement_created': 'Enregistrement de règlement créé.',
  'toast.split_applied': 'Division appliquée : Brut {0} & Frais {1}',
  'toast.split_added': 'Brut ({0}) & {1} ({2}) ajoutés',
  'error.split_no_focus':
    'Veuillez cliquer ou vous concentrer sur un champ Montant en premier pour appliquer la division des frais.',
  'error.split_no_amount': 'Veuillez saisir un montant en premier.',
  'error.split_invalid': 'Valeur de montant non valide.',
  'toast.privacy_toggled': 'Mode confidentialité activé/désactivé',
  'toast.app_updated_reload':
    'Application mise à jour. <a href="#" id="toast-reload-btn" class="ml-2 font-bold underline cursor-pointer">Recharger pour appliquer</a>',
  'toast.sqlite_loaded': 'Moteur SQLite démarré avec succès',
  'toast.sqlite_load_fail': 'Erreur : Échec du démarrage du moteur SQLite',
  'placeholder.account': 'Compte',
  'dict_edit.add_label': 'Ajouter un nouveau compte',
  'title.change_fiscal_start_month_format':
    'Modifier le mois de début (Actuellement : commence en {0})',
  'csv.preset': 'Configurations prédéfinies',
  'csv.preset_save': 'Enregistrer la configuration',
  'csv.preset_default': '-- Détection automatique des colonnes --',
  'prompt.preset_name': 'Saisir un nom pour ce préréglage CSV (ex. Amex, PayPal) :',
  'confirm.delete_preset': 'Supprimer le préréglage "{0}" ?',
  'alert.preset_name_required': 'Le nom du préréglage est requis.',
  'toast.preset_saved': 'Préréglage "{0}" enregistré avec succès.',
  'toast.preset_deleted': 'Préréglage "{0}" supprimé.',
  'confirm.delete_custom_account': 'Supprimer "{0}" du dictionnaire complètement ?',
  'alert.invalid_amount_or_formula': 'Le montant ou la formule saisi est non valide.',
  'alert.invalid_date': "Cette date n'existe pas. Veuillez vérifier le calendrier.",
  'alert.invalid_date_format': 'Format de date non valide. (ex. 31/12 ou 2026-12-31)',
  'toast.future_date': 'Une date future a été saisie.',
  'alert.csv_too_large':
    'Le fichier est trop volumineux (limite de 5 Mo). Le chargement a été annulé pour éviter le plantage du navigateur.',
  'alert.file_load_fail_memory':
    'Échec du chargement du fichier. Le fichier est peut-être corrompu ou la mémoire est insuffisante.',
  'alert.memo_and_amount_required': 'Les colonnes "Libellé" et "Montant" sont requises.',
  'alert.duplicate_columns_mapped':
    'La même colonne est associée à plusieurs champs.\nVeuillez vérifier vos associations de colonnes.',
  'alert.too_many_import_rows':
    '⚠️ Trop de lignes de données ({0} lignes).\nPour éviter que le navigateur ne se fige, seules les {1} premières lignes seront importées.\nVeuillez diviser le fichier CSV et réessayer pour le reste.',
  'alert.db_engine_starting':
    'Le moteur de base de données démarre. Veuillez patienter quelques secondes et réessayer.',
  'alert.file_too_large':
    'Le fichier est trop volumineux (limite de 50 Mo). Le fichier est peut-être non valide.',
  'toast.file_loaded': 'Fichier "{0}" chargé',
  'alert.file_load_fail': 'Échec du chargement du fichier.',
  'alert.no_export_data': 'Aucune donnée à exporter.',
  'alert.unsupported_file_type':
    'Type de fichier non pris en charge. Veuillez déposer un fichier de type .cash, .grind ou .csv.',
  'export.generic_headers':
    '"ID","Date","Compte","Montant","Devise","Taux de taxe","Libellé","Nom du bloc"',
  'prompt.ai_template':
    "Vous êtes un excellent assistant de conversion de données.\nAnalysez le \"sample CSV d'un logiciel de comptabilité inconnu\" que je vais vous présenter, et indiquez-moi le \"mappage des colonnes\" pour l'importer dans GrindCash (une application de gestion de trésorerie).\n\nLes quatre champs de données requis par GrindCash pour l'importation sont :\n- Date\n- Compte (Optionnel)\n- Libellé / Description\n- Montant\n\nJe vais coller le sample CSV ci-dessous. Veuillez l'analyser et m'indiquer quelle colonne (indexée à partir de 1, depuis la gauche) correspond à chacun des quatre champs ci-dessus.\n\n[Collez votre sample CSV ici]",
  'markdown.title': '## Données exportées (Markdown)\n\n',

  // password / security flow:
  'prompt.pw_backup':
    'Les données de sauvegarde sont chiffrées. Saisir le mot de passe de déchiffrement :',
  'prompt.pw_new':
    '🔒 Définir (ou modifier) le mot de passe.\nSaisir à nouveau le même mot de passe pour confirmer :',
  'alert.cancel_startup_desc': 'Le démarrage a été annulé. Veuillez recharger.',
  'error.security_stop_desc': 'Arrêté pour des raisons de sécurité.<br>Veuillez recharger.',

  // record / template:
  'confirm.delete_record': 'Supprimer cet enregistrement ?',
  'error.tpl_load': 'Échec du chargement des données du modèle.',
  'error.tpl_corrupted': 'Les données du modèle sont corrompues.',
  'toast.downloaded': '"{0}" téléchargé',

  // welcome / empty state:
  'welcome.title': 'Bienvenue sur GrindCash',
  'welcome.desc':
    'Glissez-déposez un fichier .cash, ou<br>créez votre premier bloc depuis le champ de saisie ci-dessus.',
  'welcome.new_block': 'Créer un nouveau bloc',
  'welcome.import_csv': 'Importer un CSV',
  'welcome.browser_ok': 'Navigateur recommandé (Chrome / Edge)',
  'welcome.fsa_enabled': "L'écriture directe sur le fichier (File System API) est activée",
  'welcome.browser_warn': '⚠️ Navigateur recommandé : Chrome ou Edge',
  'welcome.fsa_disabled':
    "Votre navigateur actuel ne prend pas en charge l'écriture directe sur le fichier. Chaque enregistrement déclenchera un téléchargement.",
  'filter_empty.title': 'Aucun enregistrement correspondant',
  'filter_empty.desc':
    "Aucune donnée n'existe pour la période sélectionnée (filtre).<br>Essayez de modifier le filtre et recherchez à nouveau.",
  'filter_empty.show_all': 'Afficher toutes les périodes',
  'alert.cell_too_long':
    'La longueur de la cellule dépasse la limite de 10 000 caractères. Le fichier CSV est peut-être non valide.',
  'alert.unclosed_quote': 'Guillemet non fermé détecté. Le fichier CSV est peut-être non valide.',
  'label.do_not_select': '-- Ne pas sélectionner --',
  'label.column_num': 'Colonne {0}',
  'csv.decode_fail':
    'Échec du décodage avec l\'encodage "{0}". Le fichier est peut-être corrompu ou l\'encodage spécifié est incorrect.',

  'export.opt_generic': 'CSV générique',
  'export.opt_xero': 'Xero',
  'export.opt_qb': 'QuickBooks Online',

  // period dropdown labels (for dynamic generation)
  'label.filter_by_year': '--- Filtrer par année ---',
  'label.filter_by_month': '--- Filtrer par mois ---',

  'cmd.split_stripe': 'Diviser les frais Stripe (2,9% + 0,30 $) sur la ligne active',
  'cmd.split_paypal': 'Diviser les frais PayPal (3,49% + 0,49 $) sur la ligne active',
  'cmd.privacy_mode': 'Activer/désactiver le mode confidentialité (masquer les chiffres)',
  'error.record_locked':
    'Impossible de modifier. Ce bloc contient des enregistrements exportés et verrouillés.',
  'alert.drop_while_saving': "Impossible d'ouvrir le fichier pendant l'enregistrement.",
  'error.csv_invalid_date': 'Format de date non valide détecté à la ligne {0} : "{1}"',
  'error.csv_abort': 'Importation annulée pour éviter la corruption des données.',
  'error.split_locked':
    "Impossible d'appliquer la division des frais sur un enregistrement déjà exporté et verrouillé.",
};
