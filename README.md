# GrindCash

**Input fast, connect to production. A fully offline, local-first accounting relay app.**

[![Demo](https://img.shields.io/badge/Demo-Play_Now-blue?style=for-the-badge)](https://grindsite.com/tools/cash/)

<img src="./grind-cash.jpg" width="800" alt="GrindCash Hero Image" />

GrindCash is an "accounting relay app (data hub)" specialized in high-speed "frontend financial processing" such as daily receipt entry and bookkeeping.

Leave complex tax laws and depreciation calculations to existing multi-functional cloud accounting software or your accountant (backend). GrindCash functions as a relay point to collect and organize daily transaction data with a lightweight UI, and seamlessly feed that data into your final production accounting system (e.g., Xero, QuickBooks Online).

## Philosophy and Features

### 1. Ultimate Data Sovereignty (No SaaS, No Subscriptions)

Your financial data is never sent to third-party servers. No monthly "rent" is required.
Everything is stored as a `.cash` (SQLite) file in your PC's local environment.
**The source code is fully public (open-source), so anyone can verify that there is no hidden external communication.**

### 2. Serverless & Fully Offline (PWA)

No PHP or database servers are required.
Once you "Install as app" from your browser, it launches and operates instantly with zero latency, even in an offline environment without the internet.

### 3. File System Access API & Strong Encryption Protection

Directly read and write the `.cash` file located on your OS locally from the browser.
Upon saving, powerful encryption using `AES-256-GCM` via the Web Crypto API is applied. Even if the file is leaked, it can absolutely never be decrypted without the password.

- **🚨 Warning:** If you forget your password, data recovery is technically 100% impossible due to the encryption mechanism. Please manage your password with extreme care.
- **💡 Recommended Browsers:** We strongly recommend using **Chrome** or **Edge**, which fully support direct overwrite saving (File System Access API). (Safari/Firefox will prompt a download save every time).

### 4. High-Speed Operation via Command Palette

Access all major features—such as saving, CSV export, and template loading—using only the keyboard via the Command Palette invoked by `Cmd+K` (Ctrl+K). Minimize mouse usage and achieve high-speed data entry without interrupting your flow of thought.

### 5. Block Editor & Template Features

Instead of legacy spreadsheet entry like Excel, records are entered in block units per event, such as "Business Trip" or "Monthly Payment". Furthermore, you can save frequently occurring transaction combinations as "Templates" and call them up instantly from the Command Palette, dramatically streamlining your data entry workflow.

### 6. Project Aggregation via Hashtags

Simply add a hashtag like `#ProjectA` or `#TaxFiling` in the memo field, and the total amount for each tag will be automatically aggregated. Click a tag to view a list of only the related transaction items.

### 7. Flexible Period Filters & High-Speed Incremental Search

Rest assured even if you accumulate 10 years of data. Features an incremental search from the left table of contents, and a quick selector to instantly switch accounting periods such as "This Year (Jan Start)" or "Q1 (Jan-Mar)". All UIs interlock with zero reloading.

### 8. "Relay Hub" Function to Connect with Any Accounting System

GrindCash itself is not the final tax filing software. The accumulated data can be flexibly exported to CSV in the format required by your accounting software. Handle daily tedious data entry smoothly locally, and feed the data into your production environment in a batch-like process at the timing of monthly or annual summaries.

### 9. Customizable Account Dictionary

In addition to standard accounts for Xero and QuickBooks, you can freely add, edit, and reorder your own custom accounts. Hide unnecessary accounts to optimize suggestions to your liking.

### 10. BYO-AI (Bring Your Own AI) Approach

To strictly maintain the "fully offline" constraint, it does not communicate directly with external AI APIs. If you want to import a CSV from an unknown accounting software, simply click to copy the built-in prompt and ask your usual ChatGPT or Claude: "Which columns are the 'Date' and 'Amount' in this CSV?" It adopts an "AI-bring-in" flexible architecture to smoothly configure import settings.

### 11. Multi-layered Local Auto-Save (Data Protection)

In addition to asynchronous draft saving (IndexedDB) every 15 seconds when typing pauses, it prevents data loss during editing. Note: Forced backup on tab close has been removed by design to prevent data corruption caused by browser suspension of async Web Worker encryption.

### 12. Freezeless Encryption via Web Worker

Even for large `.cash` files containing tens of thousands of records, extremely heavy processing such as encryption and decryption (PBKDF2 with 600,000 stretchings) is offloaded to a dedicated background thread (`crypto-worker.js`). This maintains extremely smooth operability without the main UI ever freezing, even during saving or loading.

## How to Use

1. For security reasons, please always access `index.html` in an **HTTPS environment** (GitHub Pages, Vercel, etc.) or local `localhost`.
2. From the address bar icon or the on-screen button, "Install App" as a PWA.
3. From then on, you can use it completely offline as a native PC application.

* No npm or complex build tools are required. Just download and open it in your browser.

## File Structure

- `index.html` : Main UI
- `main.js` : Application logic (Wasm SQLite control, CSV export)
- `crypto-worker.js` : Web Worker that executes encryption/decryption in the background
- `styles.css` : Styles generated by Tailwind CSS
- `sw.js` : Service Worker for PWA (fully offline, cache management)
- `manifest.json` : PWA Manifest (File Handling API registration)

## Development Background

While existing high-functionality cloud accounting software excels at tax filing and processing, they had issues with slow screen loading and overly complex UIs when performing simple daily tasks like "just entering receipts" or "quickly summarizing this month's expenses."

Therefore, GrindCash was born from the idea: Wouldn't it be great to have a tool that separates "tax processing (backend)" and "daily entry work (frontend)", allowing only the entry work to be done locally at high speed?

Inheriting the development philosophy of its sister project GrindSite—"Offline First, Serverless, Overwhelming Portability"—this app aims to reduce the stress of daily data entry to the absolute limit.

## Disclaimer

This software adopts a "local-first" architecture, and all data is stored within your PC (or your browser's IndexedDB).
Because automatic backups to external servers are not performed, there is a risk of data loss due to PC failure, browser cache clearing, or unexpected errors.

**The author assumes absolutely no responsibility for any loss of data or damages resulting from the use of this software.**

When daily entries are complete, we strongly recommend saving frequently (Cmd+S / Ctrl+S) and backing up (evacuating) the exported `.cash` file to external storage such as Google Drive or Dropbox.

## License

MIT License

---

# GrindCash (日本語 / Japanese)

**高速に入力し、本番システムへ繋ぐ。完全オフライン動作のローカルファースト会計中継アプリ**

[![Demo](https://img.shields.io/badge/Demo-Play_Now-blue?style=for-the-badge)](https://grindsite.com/tools/cash/)

<img src="./grind-cash.jpg" width="800" alt="GrindCash Hero Image" />

GrindCashは、日々のレシート入力や帳簿の整理といった「お金のフロントエンド処理」を高速に行うことに特化した**「会計中継アプリ（データハブ）」**です。

複雑な税法や減価償却の計算は、既存の多機能なクラウド会計ソフトや税理士（バックエンド）に任せましょう。GrindCashは、日々の取引データを軽快なUIで収集・整理し、最終的な本番の会計システム（Xero、QuickBooks Onlineなど）へシームレスにデータを流し込むための中継地点として機能します。

## 哲学と特徴

### 1. 究極のデータ主権 (No SaaS, No Subscriptions)

あなたの財務データは、決して他社のサーバーに送信されません。月額の「家賃」も不要です。
すべてはあなたのPCのローカル環境に `.cash`（SQLite）ファイルとして保存されます。
**ソースコードはすべて公開（オープンソース）されており、外部への隠れた通信がないことを誰もが確認できます。**

### 2. サーバーレス・完全オフライン動作 (PWA)

PHPもデータベースサーバーも不要です。
一度ブラウザから「アプリとしてインストール」を行えば、インターネットがないオフライン環境でも、遅延ゼロで瞬時に起動・動作します。

### 3. File System Access API & 強固な暗号化による保護

OSのローカルにある `.cash` ファイルをブラウザから直接読み書きします。
保存時には Web Crypto API を用いた `AES-256-GCM` による強力な暗号化が施されるため、万が一ファイルが流出してもパスワードがない限り絶対に解読されません。

- **🚨 警告:** パスワードを忘れた場合、暗号化の仕組み上、データの復元は技術的に100%不可能です。パスワードの管理には十分ご注意ください。
- **💡 推奨ブラウザ:** 直接の上書き保存（File System Access API）をフルサポートしている **Chrome** または **Edge** のご利用を強く推奨します（Safari/Firefoxでは毎回ダウンロード保存となります）。

### 4. コマンドパレットによる高速操作

`Cmd+K` (Ctrl+K) で呼び出せるコマンドパレットから、保存、CSVエクスポート、テンプレートの呼び出しなど、すべての主要機能にキーボードだけでアクセスできます。マウス操作を最小限に抑え、思考を止めない高速な入力を実現します。

### 5. ブロックエディタとテンプレート機能

Excelのようなレガシーな表入力ではなく、「出張」や「月次支払い」といったイベントごとにブロック単位で記録します。さらに、頻繁に発生する取引の組み合わせを「テンプレート」として保存し、コマンドパレットから一瞬で呼び出すことで、入力作業を劇的に効率化します。

### 6. ハッシュタグによるプロジェクト別集計

メモ欄に `#プロジェクトA` や `#確定申告用` のようにハッシュタグを付けるだけで、自動的にタグごとの合計金額が集計されます。タグをクリックすれば、関連する明細だけを一覧で確認できます。

### 7. 柔軟な期間フィルターと高速なインクリメンタル検索

10年分のデータが溜まっても安心です。左側の目次からのインクリメンタル検索や、「今年度 (1月始)」「Q1 (1-3月)」といった会計期間を一瞬で切り替えるクイック・セレクターを搭載。すべてのUIが再読み込みゼロで連動します。

### 8. あらゆる会計システムと繋がる「中継ハブ」機能

GrindCash自身は最終的な申告用ソフトではありません。溜まったデータは、お使いの会計ソフトが必要とする形式に合わせて柔軟にCSV出力が可能です。日々の面倒な入力はローカルでスムーズにこなし、月次や年次のまとめのタイミングで本番環境へバッチ処理的にデータを流し込むことができます。

### 9. カスタマイズ可能な科目辞書

XeroやQuickBooksなどの標準的な勘定科目に加え、自分だけのカスタム科目を自由に追加・編集・並び替えできます。不要な科目を非表示にして、サジェストを自分好みに最適化することも可能です。

### 10. BYO-AI（Bring Your Own AI）アプローチ

「完全オフライン」の制約を守り抜くため、外部のAI APIとは直接通信しません。未知の会計ソフトのCSVをインポートしたい場合、内蔵のプロンプトをワンクリックでコピーし、普段お使いのChatGPTやClaudeに「このCSVの『日付』と『金額』は何列目？」と尋ねるだけ。インポート設定をスムーズに行える「AI持ち込み型」の柔軟なアーキテクチャを採用しています。

### 11. 多重化されたローカル・オートセーブ（データ保護）

タイピング中の15秒ごとの非同期ドラフト保存（IndexedDB）により、編集中におけるデータの消失を防ぎます。
※ 非同期の暗号化処理がブラウザの終了によって中断されデータが破損するのを防ぐため、設計上「タブを閉じる瞬間の強制保存」は意図的に廃止されています（AI_RULES.md 準拠）。

### 12. Web Workerによるフリーズレスな暗号化

数万件のデータを含む大容量の `.cash` ファイルであっても、暗号化・復号（PBKDF2 60万回ストレッチング）といった非常に重い処理を専用のバックグラウンドスレッド（`crypto-worker.js`）にオフロードしています。これにより、保存中や読み込み中であってもメインUIが一切フリーズすることなく、極めて滑らかな操作性を維持します。

## 使い方

1. セキュリティの都合上、必ず **HTTPS環境**（GitHub Pages, Vercel等）またはローカルの `localhost` で `index.html` にアクセスしてください。
2. アドレスバーのアイコン、または画面のボタンから、PWAとして「アプリをインストール」します。
3. 以降はPCのアプリケーションとして完全にオフラインで利用できます。

※ npm や複雑なビルドツールすら不要です。ダウンロードしてブラウザで開くだけで動きます。

## ファイル構成

- `index.html` : UI本体
- `main.js` : アプリケーションロジック（Wasm SQLite制御、CSV出力）
- `crypto-worker.js` : 暗号化・復号処理をバックグラウンドで実行する Web Worker
- `styles.css` : Tailwind CSSによって生成されたスタイル
- `sw.js` : PWA用の Service Worker（完全オフライン化、キャッシュ管理）
- `manifest.json` : PWAマニフェスト（File Handling APIの登録）

## 開発の背景

既存の高機能なクラウド会計ソフトは、申告や税務処理には非常に優れていますが、日々の「ただレシートを入力する」「今月の経費をざっとまとめる」といった単純な作業を行うには、画面のロードが遅く、UIが複雑すぎるという課題がありました。

そこで、「税務処理（バックエンド）」と「日々の入力作業（フロントエンド）」を切り離し、入力作業だけをローカルで高速に行えるツールがあれば最高ではないか？という発想から GrindCash は生まれました。

本アプリは、姉妹プロジェクトである GrindSite の「オフラインファースト・サーバーレス・圧倒的なポータビリティ」という開発思想を受け継ぎ、日々の入力作業におけるストレスを極限まで減らすことを目指しています。

## 免責事項 (Disclaimer)

本ソフトウェアは「ローカルファースト」のアーキテクチャを採用しており、データはすべてお使いのPC（またはブラウザのIndexedDB）内に保存されます。
外部サーバーへの自動バックアップは行われないため、PCの故障、ブラウザのキャッシュクリア、予期せぬエラーなどによりデータが消失するリスクがあります。

**本ソフトウェアを使用したことによるデータの消失や、それによって生じた損害について、作者は一切の責任を負いません。**

日々の入力が完了した際は、こまめに保存（Cmd+S / Ctrl+S）を行い、出力された `.cash` ファイルをGoogle DriveやDropboxなどの外部ストレージにバックアップ（退避）することを強く推奨します。

## ライセンス

MIT License
