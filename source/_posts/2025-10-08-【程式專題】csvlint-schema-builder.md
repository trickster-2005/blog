---
title: 【程式專題】CSVLint Schema Builder
date: 2025-10-09T03:03:00.000+08:00
draft: false
tags:
  - 資訊
  - 技術
  - 專題
---
### \> [Demo](https://trickster-2005.github.io/csvlint-schema-builder) / [GitHub (with English description)](https://github.com/trickster-2005/csvlint-schema-builder)

[](https://github.com/trickster-2005/csvlint-schema-builder)

![](https://res.cloudinary.com/dmdeqgoxs/image/upload/v1759952717/csvlint_vetjft.png)

# CSVLint Schema Builder

## 簡介

這個專題主要處理與規範化（Schema）CSV（逗號分隔值）檔案，並協助使用者：
1. **自動產生架構 (Infer)：**\
   上傳 CSV 檔案後，工具會自動辨識欄位標題並產生 schema.json。
2. **客製化規範檔案 (Schema)：**\
   使用者可自訂每個欄位的詳細資料規範，包括：
   * 資料類型： integer、date、email 等。
   * 基礎設定： 必填 (Required)、唯一 (Unique)。
   * 進階設定：
     * 數值範圍 (Min/Max)
     * 允許值的列舉清單 (Enum)
     * 字串的正規表示式 (Regex) 
3. **標準化輸出 (CSVW)：**\
   將所有設定好的 Schema 規範檔案轉換為符合 CSV on the Web (CSVW) 國際標準的 JSON 格式，使電腦存取與跨平台使用更有效率。
4. **即時驗證 (Validation)：**\
   利用這套自定義的 Schema 即時檢查原始 CSV 資料，快速找出所有不符合規範的錯誤（如類型不符、空值、數值超限等），確保資料正確性。

- - -

## 前言：相關知識補充

### CSV（Comma-Separated Values，逗號分隔值）

常見的純文字檔案格式，每行代表一筆記錄（Row），記錄中的欄位（Field/Column）通常使用逗號或其他特定符號（如分號、Tab 鍵）分隔。由於其操作簡單，被廣泛用於資料庫或試算表等，但也因缺乏驗證容易產生錯誤。

```csv
Name, Age
Andy, 20
Tim, 65
Linda, 27
```

### Schema（資料規範）
Schema 是描述一份資料該「長什麼樣子」的規範，它會定義每個欄位的名稱、資料類型（例如文字、數字或日期），以及需要遵守的限制條件（如必填、最小值、是否唯一等）。資料使用者透過它更清楚如何讀取與使用這些資料；資料提供者也能藉此檢查（Linting/Validation）自己的資料是否符合標準。

```json
{
"@context": "http://www.w3.org/ns/csvw",
"dialect": {
    "delimiter": ",",
    "header": true
},
"tables": [
    {
    "url": "demobook.csv",
    "tableSchema": {
        "columns": [
        {
            "name": "Name",
            "titles": "Name",
            "datatype": {
            "base": "string"
            },
            "required": true
        },
        {
            "name": "Age",
            "titles": "Age",
            "datatype": {
            "base": "integer"
            },
            "required": true
        }
        ]
    }
    }
]
}
```

### CSV on the Web (CSVW)
由 W3C (World Wide Web Consortium) 制定的一套標準，將 CSV 資料和描述其結構的 Metadata（後設資料，即 Schema）連結起來，本工具輸出的 schema.json 就是遵循此標準。

- - -

## 操作方式
專案設計採用兩欄式佈局，使用者可以動態調整左右側寬度比例。左側是檔案上傳以及設定、schema.json 客製化；右側是預覽和結果。

### 一、資料上傳與設定
* **上傳 CSV 檔案**：點擊上傳 CSV 檔案。
* **基礎設定**
  * 分隔符號（Delimiter）、確認標題行（First row is header）

### 二、設定 Schema 規範（Schema Column Settings）
* 系統會根據上傳的 CSV 檔案自動產生 schema.json；亦可點擊 "import schema.json，上傳檔案。
* 左側下方可以調整欄位設定，並在右側即時預覽。若希望重設 schema.json 請點擊左側上方 "Rest schema.json"。

### 三、預覽和驗證（Preview and Validation）
右側面板提供四個分頁：
* CSV Preview： 預覽上傳的 CSV。 
* Schema Preview： 
    即時顯示根據你的設定產生的 CSVW JSON 格式 Schema，可以在這裡複製或檢查輸出的 JSON。
* Validation Result： 
    點擊左側的 Validate Current CSV 按鈕後顯示於此
  * 驗證成功： 
      顯示 ✅ Validation passed, no errors found.
  * 驗證失敗：
      詳細列出行號、列號、欄位名和錯誤訊息），以便於修正資料。
* Help：
    列出支援的資料類型和相關說明。

### 三、匯出 Schema（可選擇）
* 點擊 Download schema.json 按鈕，將設定好的 CSVW Schema 儲存到本地，供其他系統使用。
