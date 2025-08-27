console.log("✅ csv-test.js loaded");

CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [
    { name: "csv", label: "CSV Content", widget: "text" }
  ],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function(match) {
    const content = match[1].trim();
    return { csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male" };
  },
  toBlock: function(data) {
    const rows = data.csv.split("\n").map(r => r.split(","));
    const colHeaders = rows[0] || ["Name","Age","Gender"];
    const htmlRows = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + colHeaders.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while(r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    const htmlTable = `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
      ${htmlRows.join("\n")}
    </table>`;
    return `<csv-table>\n${data.csv}\n</csv-table>\n${htmlTable}`;
  },
  toPreview: function(data) {
    return CMS.widgets.get("csv-table").toBlock(data);
  },
  control: function(props) {
    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "400px";

    // 初始化 CSV
    const csvData = props.value && props.value.trim() ? props.value : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const data = csvData.split("\n").map(r => r.split(","));

    // Handsontable
    const hot = new Handsontable(el, {
      data,
      colHeaders: data[0],
      rowHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      manualColumnResize: true,
      manualRowResize: true,
      stretchH: 'all',
      filters: true,
      columnSorting: true,
      copyPaste: true,
      allowInsertColumn: true,
      allowRemoveColumn: true,
      colHeaders: true,
      manualColumnMove: true
    });

    // 新增欄位
    const addColBtn = document.createElement("button");
    addColBtn.textContent = "+ Add Column";
    addColBtn.style.margin = "4px 0";
    addColBtn.onclick = () => {
      const newColName = prompt("Enter new column name:", "New Column");
      if(!newColName) return;
      hot.alter("insert_col", hot.countCols());
      const colIndex = hot.countCols() - 1;
      hot.getSettings().colHeaders[colIndex] = newColName;
      hot.render();
    };
    el.parentNode ? el.parentNode.insertBefore(addColBtn, el) : el.insertAdjacentElement("beforebegin", addColBtn);

    // 刪除欄位（在標題點擊小 x）
    hot.updateSettings({
      colHeaders: function(col) {
        const name = this.getColHeader(col) || `Col ${col+1}`;
        return `${name} <span style="color:red; cursor:pointer;" data-col="${col}">x</span>`;
      }
    });
    el.addEventListener("click", (e) => {
      if(e.target.dataset && e.target.dataset.col) {
        const col = parseInt(e.target.dataset.col);
        if(confirm(`Delete column "${hot.getColHeader(col)}"?`)) {
          hot.alter("remove_col", col);
        }
      }
    });

    // 同步 CSV
    hot.addHook("afterChange", (changes, source) => {
      if (source === "loadData") return;
      const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
      props.onChange(updatedCSV);
    });

    // inline 編輯欄位名稱
    hot.addHook("afterGetColHeader", function(col, TH) {
      TH.contentEditable = true;
      TH.addEventListener("blur", () => {
        const newName = TH.textContent.replace(/x$/,"").trim();
        this.getSettings().colHeaders[col] = newName;
        hot.render();
      });
    });

    return el;
  }
});
