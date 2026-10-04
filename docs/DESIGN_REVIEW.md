# デザインレビュー

## 方針比較

| 案 | 強み | 確認する点 |
| --- | --- | --- |
| レコード棚 | 曲を手に取りたくなる視覚性 | 曲数が増えた時の一覧性 |
| 音楽雑誌 | 長いノーツと曲の背景を読ませる | スマホで縦に長くなりすぎないか |
| ミニマルな年表 | 経歴と曲の順序を追いやすい | 印象が弱くならないか |

## 初期レビュー 2026-10-04

実装確認：仮の曲と本人の経歴を混同しない表示、推定年度の注記、他者作詞曲の歌詞データ・ボタン非掲載、単一audio要素、曲変更時の停止とローカルURL解放、モーダルの閉じる・Escape、操作領域44px、長い曲名の折返し、固定プレイヤー用の下余白、読み込みエラー、reduced-motion。

修正：経歴を曲の前に追加。曖昧な年をnullで保持。プレイヤーのアップロード操作にキーボードフォーカス表示。スマホではプレイヤーを複数行に組み替え。

検証：npm run checkによる構文・データ・非掲載歌詞チェック。実ブラウザでのPC/スマホ表示・音声再生は未検証。現在の環境ではSitesの指定するcontrol-browserが利用できないため、代わりのブラウザ手段でのQAは行わない。画面レビューを済ませたとは扱わない。

残る項目：好みの案の選定、実曲・実音源、活動年代の確認、iPhoneでの再生、アクセシビリティと実画面の検証、正式な音源保管方法。

この記録は5回のレビューを完了したという意味ではない。方向選定後に画面レビューを行い、必要な修正を繰り返す。

追加要件：曲に紐づかない時代のノーツ。各経歴を開いて独立した文章を表示できる。本人の感情は創作せず、未入力はnullとする。未入力時には記入領域の用途が分かる表示を入れた。

## Git treeへの変更 2026-10-04

本人指定で3案比較からGit treeへ移行。主線と2本の枝で並行活動を表現し、曲をコミット風のボタンにした。felice終了とpatalpのその後未確認を区別。画面サイズとノーツ展開に追従してSVGの線を再描画する。色に加えて枝名も表示する。スマホでは3レーンの幅を縮める。構文とデータの整合性をチェック。実画面での検証は未実施。

## 明るい背景と1曲1コミット 2026-10-04

本人の追加指示を反映。背景を生成りにし、年表以外のセクションを削除。曲を独立したコミット点として17曲表示。felice/patalpの曲は交互の仮順で配置。経歴は年または枝名と情報印だけを表示し、クリックで詳細を読む。活動終了の文言とイベントを配信データから削除。枝は最後の記録で終える。ノーツは曲と経歴で同じモーダルに切り替えて表示。

検証：構文、データID、配信歌詞の対象、1曲1行とリンク、rainbow/交差点の時期を確認。実画面・スマホの見た目は、Sites指定のcontrol-browserが使えないため未検証。歌詞取得に使ったSunoのブラウザをSitesのQAに流用していない。

## Songtree by nozomitaguchiと登録音源プレイヤー 2026-10-05

最新の本人指定どおりアイコンを削除し、Songtree by nozomitaguchiをポートフォリオの元の作者名位置から左揃えに配置。作者名は小さな副字。スマホでも1段。登録音源のプレイヤーからアップロード操作や説明を省き、曲名と音声操作と閉じる操作に整理。詳細の「再生」は実際の再生を開始し、失敗は隠さず通知する。単一のaudio要素で曲を切り替える。

構文・データ検証と軽量の再生動作検証を実施。Sites指定のcontrol-browserが利用できないため、実画面・実ブラウザでの音声再生は未検証。

## Production notes転記 2026-10-05

本人のポートフォリオの8曲（スピラ・こちょばい・またね・天国が生まれた日・待ち合わせ・モノクロ・かたぐるま・どこまでが僕）のProduction notesを、そのサイトのarticle.jsが参照する本人GitHubのMarkdownから転記。セクション見出しや区切り記号を本文から除き、箇条書きの文章を維持。UIタブ名をProduction notesに変更。元ノーツと出典を保存し、全8曲の文字内容一致を検証。歌詞と音源には手を加えない。

## 新しい曲を上に表示 2026-10-05

問題：古い記録が上に並ぶため、Gitのコミットログで見慣れた新しい記録から読む順序と逆だった。表示行だけを反転し、history.json・tracks.jsonの制作順データは維持。felice・patalpの枝は古い主線の点から上向きに分岐し、それぞれの最新曲まで伸ばす。合流や活動終了の表現は追加しない。

再確認：npm run check成功。Nodeの仮DOM検証で、かたぐるまが最上段、Bornが最下段、moonbow・finderがANN入学より古い側、17曲が重複なく全て存在することを確認。2本の枝の起点・上向きカーブ・枝色と、各行・各コミット点のクリック対象17曲を検証。実画面はSites指定のcontrol-browserが利用できないため未検証。悪化した点はコード検証の範囲で見つからなかった。

## 全17曲の音源配置 2026-10-05

Sunoの通常のMP3ダウンロードから全17曲を取得。曲IDごとのaudioSrcに接続し、ファイルのMP3コーデック・再生時間・サイズとGitHub blob hashを検証。felice4曲の歌詞は配信JSONに含めない。単一プレイヤーの切り替え処理を維持。実ブラウザでの表示・再生は未検証。

## Rock bandの独立ブランチ 2026-10-05

問題：moonbow・finderが主線にあり、ロックバンドの曲という所属が線で分からなかった。Rock bandの節目と2曲をローズ系の専用枝に移動。高校期のみfeliceの横位置を再利用し、スマホのレーン数を増やさない。各枝の直後の古い主線を起点として計算し、rockの追加でfelice・patalpの分岐点が高校まで下がる不具合を防ぐ。活動終了や合流は描かない。

検証：構文・データチェックと仮DOMで17曲の一意性、新旧順、3枝の起点と上向き線・色・クリック対象を確認。実画面は指定のcontrol-browserが利用できず未検証。

## feliceの制作順 2026-10-05

本人指定の制作順two of us・midflower・空・ホワイトトリップにtrackIdsを更新。画面は新しい順なのでホワイトトリップ・空・midflower・two of us。仮年は古い2曲を2005、後の2曲を2006に合わせたが確認年とは扱わない。17曲の重複・欠落と、3枝の線・クリック対象・feliceの表示順を仮DOMで検証。実画面は未検証。

## GitHub Pages公開確認 2026-10-05

本人指定で公開先をGitHub Pagesに変更し、リポジトリ名をnozomitaguchi/songtreeへ変更。Sitesはownerのみの非公開に戻した。Actionsのdist配信が成功し、公開URLで17曲の一覧・最新順・feliceの確定順を確認。かたぐるまの再生操作でaudioのreadyState=4、paused=false、currentTimeの進行、duration=235.56秒、errorなしを確認し、閉じる操作で再生を終了。PCの公開画面をdocs/screenshots/songtree-public.jpgに記録。スマホ画面の再確認は未実施。

## Portfolio header alignment — 2026-10-05

Problem: logo and title differed from portfolio, especially mobile. Live portfolio: header 88px, logo 48px, title 17px / weight 400. Changed Songtree to those dimensions and the same SNS spacing, removed byline to preserve one row. Tree typography unchanged. npm run check passed. Live browser comparison follows deployment.

Live recheck: public portfolio and Songtree both measured header 88px × 1180px at viewport 1363px, logo 48px × 48px, title 17px / weight 400 with the same font stack. No horizontal overflow. Mobile rules match the portfolio with 48px logo and a single short title; no real mobile viewport check was available in this browser. No tree typography changes or regressions found.

## Shareable track URLs — 2026-10-05

Problem: a shared site link did not identify an open song. Added ?song=<stable track id>, History API navigation, direct-load restoration, and a compact copy-link button. Closing or starting playback returns to the base URL; Back and Forward restore the detail state. No automatic playback from links. Clipboard failure reveals a selectable URL. npm run check passed; live routing checks follow deployment.

Live recheck passed: opening kataguruma changed URL and page title; copy button reported success; reload restored its modal with audio paused; closing removed song query; Back reopened and Forward closed. white-trip shared state retained empty hidden lyrics. Published Actions completed successfully. Desktop screenshot reviewed: compact share control, no extra metadata or tree changes. Mobile browser viewport was not available for this check.

## Detail action icons — 2026-10-05

User requested symbol-only copy and play controls and removal of the Suno link. Replaced text buttons with lightweight SVG play/copy icons and 44px targets. Copy success shows a check mark and announces status through aria-live; accessible names and hover titles remain. Removed Suno DOM link and its JS updates. npm run check passed. Browser verification follows deployment.

Live recheck passed: both controls contain no visible text and measure 44×44px; accessible labels remain; Suno link count is zero. Copy reports success and changes to check symbol; play starts kataguruma (audio.paused=false) and closes modal. Reopened detail resets copy icon. Desktop screenshot reviewed: two minimal outlined circles, no layout regression. No separate mobile viewport check was available.

## Dialog initial focus — 2026-10-05

User's iPhone screenshot shows an unwanted focus ring on the auto-focused close button. Set autofocus on the song heading with tabindex=-1 and explicitly focus it after showModal, without scrolling. Suppress the outline only on this non-interactive heading; preserve interactive keyboard focus styles. npm run check passed. Live verification follows deployment; iPhone Safari itself is not available in the desktop browser.

Live recheck passed in desktop Chrome: direct URL reload focused detail-title with outline:none and close button not focused; Shift+Tab moved to close-detail with :focus-visible and solid outline. Closing and opening again focused the heading. Screenshot reviewed: no ring on close at rest. GitHub Pages deploy succeeded. iPhone Safari behavior requires device confirmation; no blanket suppression of button focus was introduced.

## Sharing, favicon and SEO — 2026-10-05

Removed the stale noindex directive from the public homepage. Added static descriptions, canonical URLs, OGP/Twitter cards using the existing iPad cover (1672×941), structured music data and a sitemap. Added a branch favicon in SVG/PNG/ICO and iOS/manifest icons. Generated 17 dedicated /songs/<id>/ pages with per-song metadata before JavaScript; copy now emits these URLs. Legacy ?song links still resolve. Added a site-root base URL to preserve media and scripts on nested routes, and a no-JS content fallback; felice lyrics remain absent. CI regenerates pages and validates canonicals, nested base URLs and lyric omission. Build and check passed. Live checks follow deployment; actual search indexing and social cache refresh are external.

Live recheck: dedicated kataguruma URL loads its dialog with canonical, per-song OGP title, cover, favicon and index directive. Registered audio resolves to /songtree/audio/kataguruma.mp3 and plays. Old query URL still opens and copy emits the new dedicated route. Initial live load caught base href appearing after resource tags; moved it ahead of all script/CSS preloads, added regression checks, redeployed and reverified. Raster icon strokes refined after image inspection. Pages and portfolio robots deploys succeeded. Social platforms themselves and search indexing were not forced or tested through account posting.

## Muted branch palette — 2026-10-05

User requested calmer, balanced branch colors. Before: felice ochre #976522 and patalp blue #506ca5 dominated the cream page. Changed felice to warm taupe #7d6f5e, patalp to slate #65717d, rock to dusty mauve #806b74; retained sage main. Graph now reads branch variables from CSS so lines, nodes, titles, labels, tags and detail accents stay consistent. Type sizes and layout unchanged. Build and checks passed; live visual review follows deployment.
