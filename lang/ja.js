export default {
  'app.title': 'GrindCash',
  'toc.filter': '目次を絞り込み...',
  'title.current_file': '現在開いているファイル',
  'filename.unsaved': 'Unsaved.cash',
  'btn.install': '↓ アプリとしてインストール',
  'dict.select': '科目辞書を選択',
  'dict.select_title': '入力時にサジェストする科目辞書を選択',
  'dict.custom': '辞書: カスタム',
  'dict.none': '科目サジェスト: オフ',

  'placeholder.password': '暗号化パスワード...',
  'title.password_help': 'パスワードを入力すると保存時にファイルを強力に暗号化します',
  'title.toggle_password': 'パスワードの表示/非表示',
  'btn.open': '開く',
  'btn.save': '保存',
  'title.cmd': 'コマンドパレットを開く',
  'status.loading': 'SQLiteエンジンを起動中...',
  'filter.all': 'すべての期間',
  'period.all': 'すべての期間',
  'period.jan_mar': '1-3月',
  'period.apr_jun': '4-6月',
  'period.jul_sep': '7-9月',
  'period.oct_dec': '10-12月',
  'period.this_year': '今年 (1-12月)',
  'period.prev_fiscal_year': '前年度',
  'period.this_fiscal_year': '今年度',
  'title.change_fiscal_start_month': '開始月を変更',
  'placeholder.new_block': '新しいブロックを作成 (例: 2026年5月 東京出張) ...',
  'btn.expand_all': 'すべて展開',
  'btn.collapse_all': 'すべて折りたたむ',
  'error.fatal': 'アプリの起動に失敗しました',
  'error.fatal_desc':
    '必須ファイルが読み込めませんでした。<br />通信環境を確認し、ページを再読み込みしてください。',
  'btn.reload': 'ページを再読み込み',
  'csv.title': 'CSVインポート設定',
  'csv.desc': 'CSVの各列をGrindCashのデータに割り当ててください。',
  'csv.date': '日付の列',
  'csv.optional': '(任意)',
  'csv.account': '勘定科目の列',
  'csv.memo': 'メモ(摘要)の列',
  'csv.amount': '金額の列',
  'csv.preview': 'データプレビュー (最初の数行)',
  'csv.skip_first': '最初の',
  'csv.skip_rows': '行をスキップする',
  'csv.encoding': '文字コード:',
  'btn.cancel': 'キャンセル',
  'btn.import': 'インポート実行',
  'export.title': 'CSVエクスポート',
  'export.desc': '出力する会計ソフトのフォーマットを選択してください。',
  'export.format': '出力フォーマット',
  'btn.export': 'エクスポート',
  'dict_edit.title': 'カスタム科目辞書の編集',
  'dict_edit.desc':
    'よく使う科目を登録・並び替えできます。<br />目のアイコンをクリックするとサジェストから非表示にできます。',
  'btn.show_all': 'すべて表示',
  'btn.hide_all': 'すべて非表示',
  'placeholder.new_account': '新しい科目を追加',
  'btn.add': '追加',
  'btn.save_close': '保存して閉じる',
  'prompt.pw_title': 'パスワードの入力',
  'prompt.pw_desc': 'ファイルは暗号化されています。解除パスワードを入力してください:',
  'btn.ok': 'OK',
  'prompt.ios_install_btn': 'ホーム画面に追加',
  'drop.title': '.cash ファイルをドロップして開く',
  'drop.desc1': 'そのまま上書き保存も可能です',
  'drop.desc2': '※画面をクリックするとこの表示を消せます',
  'cmd.search': 'コマンド検索',
  'cmd.placeholder': 'Type a command or search...',

  // main.js inside strings:
  'toast.restored': '未保存データを復元しました',
  'toast.saved': 'データを保存しました',
  'toast.copied': 'コピーしました',
  'alert.restore_fail': '⚠️ 前回の未保存データが破損しているため、復元を中止しました。',
  'confirm.discard_changes': '未保存のデータがあります。変更を破棄して別のファイルを開きますか？',
  'confirm.pw_empty':
    '⚠️ 警告 ⚠️\nパスワードが空になっています。\nこのまま保存すると、ファイルの暗号化が解除され「平文」で保存されます。\n\n本当に暗号化を解除して保存しますか？',
  'alert.pw_empty_canceled':
    '保存を中断しました。パスワードを空のままにせず、再度入力してください。',
  'alert.pw_mismatch': '❌ パスワードが一致しません。保存を中止しました。',
  'alert.write_permission_fail':
    'ファイルの書き込み権限が取得できませんでした。時間経過によりブラウザが権限を取り消した可能性があります。\n\n「複製して保存する (Save As)」をお試しください。',
  'toast.saved_to': 'データを "{0}" に保存しました',
  'toast.save_error': 'エラー: ファイルの保存に失敗しました。容量や権限を確認してください',
  'alert.multi_tab':
    '⚠️ GrindCashは既に別のタブまたはウィンドウで開かれています。\n\nデータ競合（バックアップの巻き戻り）を防ぐため、このタブでの編集は行わないでください。',
  'alert.http_desc':
    '⚠️ セキュリティ警告 ⚠️\n\n現在のアクセス環境 (HTTP) では、ブラウザのセキュリティ制限によりファイルの読み書きや暗号化機能がブロックされます。\n\nGrindCashを正常に動作させるには、必ず「HTTPS」環境にアップロードするか、「localhost」で実行してください。',
  'error.http_required': 'エラー: HTTPS環境またはlocalhostでの実行が必要です',

  // templates
  'prompt.save_tpl_title':
    'このブロックをテンプレートとして保存します。\n呼び出し用の名前を入力してください:',
  'toast.tpl_saved':
    '✅ テンプレート「{0}」を保存しました。\nコマンドパレット(Cmd+K)からいつでも一発で呼び出せます。',
  'confirm.delete_tpl': 'テンプレート「{0}」を削除しますか？',
  'cmd.insert': '[挿入] {0}',
  'cmd.delete': '[削除] {0}',

  // command titles:
  'cmd.save_title': 'データを保存する (Save)',
  'cmd.open_title': 'ファイルを開く (Open)',
  'cmd.saveas_title': '複製して保存する (Save As)',
  'cmd.new_title': '新しいブロックを作成する (New)',
  'export.unexported_only': '未エクスポートの明細のみ出力する（出力後にエクスポート済みにする）',
  'cmd.import_title': 'CSVインポート (Import CSV)',
  'cmd.export_title': 'CSVエクスポート (Export CSV)',
  'cmd.editdict_title': 'カスタム科目辞書を編集',
  'cmd.ai_title': 'AI用プロンプトをコピー (AI)',
  'cmd.markdown_title': 'Markdownとしてコピー (GrindSite用)',
  'cmd.expandall_title': 'すべてのブロックを展開する',
  'cmd.collapseall_title': 'すべてのブロックを折りたたむ',
  'cmd.calc_copied': '{0} をコピーしました',
  'cmd.calc_inserted': '{0} を直接入力しました',

  // index.html/main.js logic labels
  'label.grand_total': 'Total Amount',
  'label.period_info_all': '💡 現在表示中の <b>すべての期間</b> のデータが出力されます。',
  'label.period_info_filtered': '💡 現在表示中の <b>「{0}」</b> のデータが出力されます。',
  'label.empty_blocks': '取引データがありません。',
  'label.period': '期間',
  'label.tag_modal_title': '{0} (全{1}件)',
  'label.no_date': '日付なし',
  'label.unclassified': '未分類',
  'label.unnamed': '名称未設定',
  'label.undecided': '金額未定',
  'toast.no_copy_data': 'コピーするデータがありません。',
  'toast.md_copied': 'Markdownでコピーしました',
  'toast.import_success': '{0} 件のデータをインポートしました',
  'toast.import_skip': '（{0}件は金額が不正なためスキップされました）',
  'error.import_fail': 'インポート中にエラーが発生しました。',
  'toast.filter_outside': '追加した日付がフィルター外のため、「すべての期間」に表示を戻しました',
  'tooltip.edit_date': 'クリックで日付を編集 (YYYY/MM/DD のフル入力にも対応)',

  // custom dict editor:
  'dict_edit.show': '表示する',
  'dict_edit.hide': '非表示にする',
  'dict_edit.delete_title': '完全に削除する',

  // fiscal year start month change:
  'prompt.fiscal_month': '年度の開始月を入力してください (1〜12)',
  'alert.invalid_fiscal_month': '1から12の数値を入力してください。',
  'confirm.sort_by_date':
    'このブロック内の明細を「日付が古い順」に並べ替えますか？\n（同じ日付の場合は入力した順になります）',
  'confirm.restore_draft':
    '⚠️ 前回終了時の未保存データ（バックアップ）が見つかりました。\n\n復元しますか？\n（「キャンセル」を押すとバックアップは破棄されます）',
  'toast.prompt_copied': 'AI用プロンプトをコピーしました',
  'toast.sorted': '日付順にソートしました',
  'toast.settlement_created': '決済レコードを作成しました',
  'toast.split_applied': '分割しました: 総額 {0} & 手数料 {1}',
  'toast.split_added': '追加しました: 総額 ({0}) & {1} ({2})',
  'error.split_no_focus': '手数料を分割するには、まず金額欄をクリックしてフォーカスしてください。',
  'error.split_no_amount': '先に金額を入力してください。',
  'error.split_invalid': '無効な金額です。',
  'toast.privacy_toggled': 'プライバシーモードを切り替えました',
  'toast.app_updated_reload':
    'アプリが最新版に更新されました。<a href="#" id="toast-reload-btn" class="ml-2 font-bold underline cursor-pointer">リロードして適用</a>',
  'toast.sqlite_loaded': 'SQLite起動完了',
  'toast.sqlite_load_fail': 'エラー: SQLiteの起動に失敗しました',
  'placeholder.account': '科目',
  'dict_edit.add_label': '新しい科目を追加',
  'title.change_fiscal_start_month_format': '開始月を変更 (現在の設定: {0}月始)',
  'csv.preset': 'プリセット設定（設定の保存・呼出）',
  'csv.preset_save': '現在の設定を保存',
  'csv.preset_default': '-- 列を自動検出する --',
  'prompt.preset_name': 'このCSVプリセットの名前を入力してください（例: Amex, PayPal）:',
  'confirm.delete_preset': 'プリセット「{0}」を削除しますか？',
  'alert.preset_name_required': 'プリセット名を入力してください。',
  'toast.preset_saved': 'プリセット「{0}」を保存しました。',
  'toast.preset_deleted': 'プリセット「{0}」を削除しました。',
  'confirm.delete_custom_account': '「{0}」を辞書から完全に削除しますか？',
  'alert.invalid_amount_or_formula': '金額の入力、または数式が正しくありません。',
  'alert.invalid_date': '存在しない日付です。カレンダーを確認してください。',
  'alert.invalid_date_format': '日付の形式が正しくありません。(例: 12/31 または 2025-12-31)',
  'toast.future_date': '未来の日付が入力されました',
  'alert.csv_too_large':
    'ファイルサイズが大きすぎます（5MB上限）。ブラウザがクラッシュするのを防ぐため読み込みを中止しました。',
  'alert.file_load_fail_memory':
    'ファイルの読み込みに失敗しました。ファイルが破損しているか、メモリが不足しています。',
  'alert.memo_and_amount_required': '「メモ」と「金額」の列は必須です。',
  'alert.duplicate_columns_mapped':
    '同じ列が複数の項目に割り当てられています。\nマッピング（列の選択）を見直してください。',
  'alert.too_many_import_rows':
    '⚠️ データが多すぎます（{0}行）。\nブラウザのフリーズを防ぐため、最初の{1}行のみをインポートします。\n残りのデータはCSVを分割してインポートしてください。',
  'alert.db_engine_starting':
    'データベースエンジンを起動中です。数秒待ってから再度お試しください。',
  'alert.file_too_large':
    'ファイルサイズが大きすぎます（50MB上限）。不正なファイルの可能性があります。',
  'toast.file_loaded': 'ファイル "{0}" を読み込みました',
  'alert.file_load_fail': 'ファイルの読み込みに失敗しました。',
  'alert.no_export_data': 'エクスポートするデータがありません。',
  'alert.unsupported_file_type':
    'サポートされていないファイルです。.cash、.grind または .csv 形式のファイルをドロップしてください。',
  'export.generic_headers': '"ID","日付","勘定科目","金額","通貨","税率","摘要","ブロック名"',
  'prompt.ai_template':
    'あなたは優秀なデータ変換アシスタントです。\n私から提示する『未知の会計ソフトのサンプルCSV』を解析し、GrindCash（お金管理アプリ）に取り込むための『列の割り当て（マッピング）』を教えてください。\n\nGrindCashがインポートで必要とするデータは以下の4つです：\n・日付\n・勘定科目 (任意)\n・摘要 または メモ\n・金額\n\n以下の枠内にサンプルCSVを貼り付けるので、上記の4つがそれぞれ「左から何列目」にあるかを解析して教えてください。\n\n[ここにサンプルCSVを貼り付けてください]',
  'markdown.title': '## 出力データ (Markdown)\n\n',

  // password / security flow:
  'prompt.pw_backup': 'バックアップデータは暗号化されています。解除パスワードを入力してください:',
  'prompt.pw_new':
    '🔒 パスワードの設定（または変更）\n確認のため、同じパスワードをもう一度入力してください:',
  'alert.cancel_startup_desc': '起動がキャンセルされました。ページを再読み込みしてください。',
  'error.security_stop_desc':
    'セキュリティのため停止しました。<br>ページを再読み込みしてください。',

  // record / template:
  'confirm.delete_record': 'この明細を削除しますか？',
  'error.tpl_load': 'テンプレートの読み込みに失敗しました。',
  'error.tpl_corrupted': 'テンプレートのデータが破損しています。',
  'toast.downloaded': '"{0}" をダウンロードしました',

  // welcome / empty state:
  'welcome.title': 'Welcome to GrindCash',
  'welcome.desc':
    '.cash ファイルをドラッグ＆ドロップするか、<br>上の入力欄から最初のブロックを作成しましょう。',
  'welcome.new_block': '新しいブロックを作る',
  'welcome.import_csv': 'CSVをインポート',
  'welcome.browser_ok': '推奨ブラウザ環境 (Chrome / Edge)',
  'welcome.fsa_enabled': 'ファイルの直接上書き保存（File System API）が有効です',
  'welcome.browser_warn': '⚠️ 推奨ブラウザ: Chrome または Edge',
  'welcome.fsa_disabled':
    '現在のブラウザは直接上書き保存に非対応のため、保存時に毎回ダウンロードが発生します。',
  'filter_empty.title': '該当する記録がありません',
  'filter_empty.desc':
    '指定された期間（フィルター）にはデータが存在しません。<br>フィルター条件を変更して再度お試しください。',
  'filter_empty.show_all': 'すべての期間を表示',
  'alert.cell_too_long':
    'セルの文字数が制限(10,000文字)を超えました。不正なCSVの可能性があります。',
  'alert.unclosed_quote': '未閉じのクォーテーションが存在します。不正なCSVの可能性があります。',
  'label.do_not_select': '-- 選択しない --',
  'label.column_num': '列 {0}',
  'csv.decode_fail':
    '文字コード「{0}」でのデコードに失敗しました。ファイルが破損しているか、文字コードの指定が間違っています。',

  'export.opt_generic': '汎用CSV',
  'export.opt_xero': 'Xero',
  'export.opt_qb': 'QuickBooks Online',

  // period dropdown labels (for dynamic generation)
  'label.filter_by_year': '--- 年度で絞り込み ---',
  'label.filter_by_month': '--- 月別で絞り込み ---',

  'cmd.split_stripe': 'Stripe手数料(2.9% + $0.30)を分割記帳 (フォーカス行)',
  'cmd.split_paypal': 'PayPal手数料(3.49% + $0.49)を分割記帳 (フォーカス行)',
  'cmd.privacy_mode': 'プライバシーモード切替 (数値を隠す)',
  'error.record_locked': 'エクスポート済みの明細が含まれているため、このブロックは編集できません。',
  'alert.drop_while_saving': '保存処理中はファイルを開けません。',
  'error.csv_invalid_date': '{0}行目で無効な日付フォーマットを検出しました: "{1}"',
  'error.csv_abort': 'データ破損を防ぐため、インポートを中止しました。',
  'error.split_locked': 'エクスポート済みの明細に対して、手数料の分割記帳は適用できません。',
};
