# 專案協作指引

## 技術限制

- 本專案為純前端專案，只使用 HTML、CSS 與原生 JavaScript。
- 禁止引入任何框架或套件；不要建立 `package.json`，也不要執行 `npm install`。
- 不要引用外部 CDN，專案必須能離線運作。
- 檔案結構固定為根目錄的 `index.html`、`styles.css`、`app.js`。

## 程式風格

- 程式碼註解一律使用繁體中文；變數與函式名稱使用英文 camelCase。
- CSS 顏色一律使用 `:root` 定義的 CSS 變數，不要在其他位置寫死色碼。
- 使用 `const` 與 `let`，不要使用 `var`。
- 建立 DOM 內容時使用 `textContent` 或 `createElement`，不要使用 `innerHTML` 組字串。

## 協作方式

- 修改程式碼前，先條列說明預計修改的檔案與變動內容，並等待使用者確認後再開始。
- 一次只處理一件事；不要順手進行未受要求的重構。
- 修改完成後，說明如何在瀏覽器中驗證變更。
