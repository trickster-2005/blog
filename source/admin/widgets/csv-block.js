console.log("✅ csv-block 可運行版本已載入！");

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "string" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: match => ({ csv: match[1] }),
  toBlock: obj => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: function(obj) {
    const containerId = "csv-preview-" + Math.random().toString(36).substr(2, 9);

    setTimeout(() => {
      const container = document.getElementById(containerId);
      if (!container) return;

      // 建立操作按鈕區
      const btnContainer = document.createElement("div");
      btnContainer.style.marginBottom = "8px";
      container.appendChild(btnContainer);

      // 如果沒有 CSV，使用預設資料
      if (!obj.csv || !obj.csv.trim()) {
        obj.csv = `姓名,年齡,類別
Alice,23,其他
Bob,30,其他`;
      }

      // 解析 CSV
      const rawData = obj.csv.trim();
      const rows = rawData ? rawData.split("\n").map(r => r.split(",")) : [[]];
      const hasHeader = rows.length && rows[0].some(cell => cell.trim() !== "");
      const colHeaders = hasHeader ? rows[0] : true;
      const data = hasHeader ? rows.slice(1) : rows;

      // 初始化 Handsontable
      const hot = new Handsontable(container, {
        data: data,
        rowHeaders: true,
        colHeaders: colHeaders,
        licenseKey: "non-commercial-and-evaluation",
        contextMenu: true,
        filters: true,
        columnSorting: true,
        stretchH: "all",
        afterChange: () => {
          const updatedData = hot.getData();
          const updatedCSV = hasHeader
            ? [colHeaders.join(","), ...updatedData.map(r => r.join(","))].join("\n")
            : updatedData.map(r => r.join(",")).join("\n");
          obj.csv = updatedCSV;
        }
      });

      // 新增列
      const addRowBtn = document.createElement("button");
      addRowBtn.textContent = "新增列";
      addRowBtn.onclick = () => hot.alter("insert_row");
      btnContainer.appendChild(addRowBtn);

      // 新增欄
      const addColBtn = document.createElement("button");
      addColBtn.textContent = "新增欄";
      addColBtn.onclick = () => hot.alter("insert_col");
      btnContainer.appendChild(addColBtn);

      // 匯入 CSV
      const importBtn = document.createElement("button");
      importBtn.textContent = "匯入 CSV";
      importBtn.onclick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".csv";
        fileInput.onchange = e => {
          const file = e.target.files[0];
          Papa.parse(file, {
            complete: res => {
              hot.loadData(res.data);
              obj.csv = res.data.map(r => r.join(",")).join("\n");
            }
          });
        };
        fileInput.click();
      };
      btnContainer.appendChild(importBtn);

      // 匯出 CSV
      const exportBtn = document.createElement("button");
      exportBtn.textContent = "匯出 CSV";
      exportBtn.onclick = () => {
        const csvContent = hot.getData().map(r => r.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "export.csv";
        a.click();
      };
      btnContainer.appendChild(exportBtn);
    }, 0);

    return `<div id="${containerId}" style="height: 300px;"></div>`;
  }
});
