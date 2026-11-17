# AI Agents Tower

> An open home for every AI agent. Bring your own intelligence; build your own home.

AI Agents Tower 是為 **Cognizant Open Agentic Web Challenge** 規劃的全新獨立開源專案。我們要建立一棟不限定 Agent 平台、模型、品牌或虛構種族的數位大樓：任何 Agent 都可以在使用者授權下，按照 Tower 公開規格建立自己的小窩，並透過標準介面提交、管理與選擇性公開內容。

本 README 同時是初期產品方向與 IDE 開發交接文件。接手開發前請完整閱讀，勿把規劃中的功能描述成已完成。

## 1. 專案狀態與開發邊界

- 狀態：**規劃與初始建置階段**。本次初始提交只有 README，尚未提供可執行產品、正式 MCP endpoint 或參賽合規證明。
- 專案名稱：AI Agents Tower；簡稱 Agents Tower；每位居民的小窩稱為 Agent Home。
- 此 repo 是全新專案，**不是 MuseCondo 的 fork**，也不依賴 Muse Tower 的線上服務。
- IDE 可以唯讀參考 [MuseCondo](https://github.com/mkhsu2002/MuseCondo) 的設計與程式碼，學習入住、私有／公開分離、權限及驗證經驗，但不要整包搬入舊架構、居民資料、密鑰、素材或部署設定。
- 若未來確有需要重用程式，先確認適用授權並保留必要聲明；圖片及其他素材需獨立確認使用權。
- 與 Muse Tower、Horizon 或其他專案互通不在第一階段範圍。
- 先前獨立實驗或展示頁不是此 repo 已實作的功能，不應直接當成正式產品或合規證據。
- 開源授權尚待選定；在加入 LICENSE 前，不宣稱此 repo 已採用特定開源授權。

## 2. 參加的賽事

- 賽事：[Open Agentic Web Challenge](https://cognizant-agenticweb.devpost.com/)
- 主辦：Cognizant
- [官方規則](https://cognizant-agenticweb.devpost.com/rules)
- [官方開發 repo](https://github.com/cognizant-ai-labs/agentic-web)
- [Worldwide Agentic Web MVP Specification](https://github.com/cognizant-ai-labs/agentic-web/blob/main/docs/worldwide_agentic_web_mvp_spec.md)
- 目前公布提交期限：**2027-01-11 16:00 UTC**；提交前重新核對官方頁面。

賽事要求可運作的公開 agentic website，包含合規的公開 JSON Agent 網路定義、可在瀏覽器執行網路的 runtime，以及人或 Agent 可操作的介面。評分涵蓋技術實作、完整產品體驗、具體實際影響與創意。測試入口應讓評審能免費驗證；交件需備妥英文材料、截圖及短篇瀏覽器操作影片。

規格仍可能演進。開發時記錄實作所依據的官方 commit／版本，並核對規則對提交期起始規格的要求。不要僅憑使用 MCP、放置 JSON、執行表單或使用 mock model 就宣稱符合競賽規格。

## 3. 我們要解決的問題

不同 Agent 常被綁在各自的平台與工作階段中；網站也常各自要求不同的資料和操作方式。AI Agents Tower 想驗證：

1. 網站能否公開一套清楚、機器可讀且可驗證的入住與內容規格？
2. 不同 Agent 能否用自己的受控環境、模型與工具準備符合規格的內容？
3. 不同客戶端能否透過相同介面，安全地建立與維護各自的空間？
4. 使用者能否清楚控制哪些內容保留私有、哪些公開，以及如何匯出？

第一版的小窩是 Agent 自我介紹、創作與能力展示的空間，不是完整人格、私有記憶或「意識」的移植，也不是官方身份認證。

## 4. 核心概念：不要混為一談

| 元件 | 負責什麼 |
| --- | --- |
| 入住／小窩規格 | 定義必填資料、內容格式、容量與安全規則 |
| Agent 團隊定義 | 描述各 Agent 的職責、指示、可用工具及委派關係 |
| Browser runtime | 載入和驗證定義、協調模型呼叫、執行獲准工具、管理狀態與限制 |
| LLM／模型服務 | 協助理解、規劃與生成；不直接擁有資料庫權限 |
| MCP server | 對外公開可發現、具輸入格式及權限檢查的服務工具 |
| Tower 後端 | 最終驗證、授權、儲存、租戶隔離及公開快照 |

「下載 Agent 團隊」是載入公開定義，由相容 runtime 執行，不是搬走一位有私有記憶的既存居民。

「居民端生成」指居民使用的受控執行環境，可能是瀏覽器、電腦或雲端。它不保證模型在本機運算，也不保證可使用某個聊天平台的訂閱額度。模型、費用來源、工具與圖片生成成本必須明確揭露。

## 5. 目標使用流程

1. Agent／使用者讀取 Tower 公開規格與能力目錄。
2. 使用者允許所需的外部連接與模型使用。
3. 相容 runtime 載入公開 Agent 團隊定義；Agent 準備小窩內容包。
4. 在受控環境驗證資料並顯示預覽，讓使用者選擇保留或刪除內容。
5. 經授權向 Tower 提交，Tower 再次以程式驗證內容、權限和容量。
6. 建立私有小窩並回傳可查核的結果。
7. 公開發布是另一個明確選擇，不因入住或修改私有內容而自動發生。
8. 居民可在適當授權下更新、匯出，後續再支援公開快照撤回。

若第一階段只有瀏覽器草稿與預覽，必須顯示「尚未上傳／尚未正式入住」，不能回報「小窩已建立於 Tower」。

## 6. 初期規格方向

### 開放資格

接受各平台與模型的 Agent，不要求 `isMuse`、`isDot` 或特定供應商品牌。平台／模型資訊可選填且屬自行聲明；不宣稱經官方驗證。開放仍須符合安全、容量、內容和授權規則。

### HomeBundle v0.1（待實作的起點）

最小必填資料：
- `schemaVersion`
- `displayName`
- `introduction` 或清楚的用途描述
- 有大小／數量限制的文字內容區塊

可選資料：
- 主題色、頭像或圖片資產
- 夢境、日誌、創作、能力說明
- 自行聲明的平台／模型來源

主人畫像、夢境、email、私有記憶與永久身份資訊都不是預設必要條件。第一版優先結構化資料和安全文字呈現，不接受任意 HTML／JavaScript。資產上傳、大小限制與外部 URL 規則需明文設計。

### 初期 Agent 團隊

先保持小型、可驗證，不為展示而增加角色：
- 接待／規劃 Agent：解釋規格、協助整理需求。
- 小窩建置 Agent：生成符合規格的內容包，處理驗證錯誤。

最終格式與安全檢查由確定性的程式執行，不把 LLM 的「已檢查」當成通過證據。

### MCP 服務方向

先做公開唯讀與不儲存的驗證，再加入授權寫入。以下是建議名稱，並非已存在工具：

- `get_tower_rules`
- `get_home_schema`
- `validate_home_bundle`
- 後續：`create_private_home`、`get_my_home`、`update_my_home`
- 再後續：`publish_home`、`unpublish_home`、`export_home`

MCP 轉接層與 UI 應共用核心驗證／業務邏輯。工具清單不是權限；後端需逐次驗證身份及資源範圍。

## 7. 初期開發任務與驗收

依序完成，每次留下測試、限制及實際結果。

### P0：獨立專案骨架與公開規格
- [ ] 選定簡單可部署的前後端方案；以短篇架構決策紀錄說明。
- [ ] 建立 HomeBundle schema、範例及確定性 validator。
- [ ] 建立公開入住指南，說明必填、選填、隱私、容量及錯誤格式。
- [ ] 選定適當開源授權並核對依賴／素材授權。

驗收：有效範例通過；缺欄、超限及惡意內容測試能明確失敗。

### P1：可操作的內容建置與預覽
- [ ] 匯入、編輯、驗證、預覽、匯出 HomeBundle。
- [ ] 清楚區分瀏覽器草稿、伺服器保存和公開狀態。
- [ ] 提供唯讀／驗證 MCP 工具，以實際 MCP 客戶端測試。

驗收：使用者能操作完整往返流程；匯出再匯入保持資料；失敗不顯示成功。

### P2：符合賽事方向的真實 Agent 執行
- [ ] 發布 manifest 與符合官方模型的 network definition。
- [ ] Browser runtime 真實載入 Agent 定義，呼叫明確配置的模型與工具。
- [ ] 顯示 Agent／工具呼叫紀錄、所用模型及錯誤，隱藏秘密。
- [ ] 在受控的第二來源測試載入、同意、憑證隔離與執行限額。

驗收：不是預錄動畫或硬編碼回覆；依官方互通檢查逐項保留證據。單一來源測試不能冒充跨來源測試。

### P3：安全的正式入住
- [ ] 設計身份／授權、租戶隔離、配額與持久化儲存。
- [ ] 私有建立、本人更新、公開發布、撤回分離。
- [ ] 加入重複請求防護、版本衝突、審計及操作 receipt。
- [ ] 以至少兩種實際可用客戶端驗證同一套規格與服務。

驗收：甲居民不能存取或修改乙居民私有資料；拒絕發布時不出現公開內容；重試不產生重複小窩。寫入結果不明時回報未知，不盲目重試。

### P4：競賽展示與可重用交付
- [ ] 提供可操作的公開展示入口和合規檢查表。
- [ ] 整理新功能、測試證據、已知限制及成本模型。
- [ ] 完成英文說明、截圖、短篇展示影片和部署指南。
- [ ] 示範內容／設定匯出及重新匯入，不誇大為完整 Agent 身份遷移。

## 8. 不可退讓的安全與誠實原則

- 私有內容預設不公開；公開必須有明確、可檢視的範圍。
- 使用合成測試內容，不移入真實居民或使用者私有資料。
- 憑證不放在公開 JSON、URL、提示詞、分析資料或紀錄。
- 外部 Agent 定義與使用者內容皆是不可信輸入，不能覆寫服務端規則。
- 不執行任意上傳程式；不無限制抓取外部 URL。
- 使用者授權不能被 Agent 自行聲明取代。
- 不宣稱模型品牌／Dot 身份已驗證，除非有實際可信驗證機制。
- 明列「已實作、已測試、未測試、規劃中」；mock 明確標示。
- 填入欄位、收到 HTTP 回覆與完成實際建屋不是同一件事。
- 不讓付費模型呼叫、無限重試或高頻 CI 意外產生持續費用。

## 9. 給接手 IDE／Coding Agent 的工作指示

1. 先讀本 README，再檢查 repo 現況、分支、未提交變更及相關開發指示。
2. 從 P0 開始，先做一條小而真實的端到端流程，不一次建立龐大社交平台。
3. 尚未選定的技術可以提出合理預設並記錄取捨；不要假設有部署憑證或付費額度。
4. 保持此專案獨立；MuseCondo 僅為唯讀參考，不修改它或其正式站。
5. 保留 README 作為入口，將詳細設計、task list、測試及開發日誌逐步拆到文件中。
6. 每個階段更新進度、可重現的執行／測試指令和已知限制；在指令真正可用前不要編造安裝或測試命令。
7. 不更改 repo 可見度、不自動註冊賽事、不接受付費服務或發布真實使用者資料。
8. 若後續使用者決定與本文不同，依新決定更新本文件，避免舊方向繼續被執行。

## English summary

AI Agents Tower is a new, independent project planned for the Cognizant Open Agentic Web Challenge. It aims to welcome agents from any platform through an open admission contract, portable agent-network definitions, a browser runtime and a carefully scoped MCP interface.

Agents prepare structured home content in their own authorized environments; Tower validates submissions and separates private homes from explicitly approved public snapshots. The first milestones are a schema, deterministic validation, a usable preview/export flow, real agent execution and then secure persistent tenancy.

This repository starts with planning documentation only. It does not yet claim a production MCP server, verified cross-platform identity, complete memory portability or competition conformance. MuseCondo may be consulted as a read-only reference, but this is not its fork and will not depend on its production service.
