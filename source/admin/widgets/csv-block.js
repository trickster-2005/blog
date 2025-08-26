console.log("✅ csv-block-no-react 基本版本（含 debug）已載入！");

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "string" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: match => ({ csv: match[1] }),
  toBlock: obj => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: function(obj) {
    const containerId = "csv-preview-" + Math.random().toString(36).substr(2, 9);
    console.log("toPreview called, containerId:", containerId);

    // 這裡初始化預設資料，如果 obj.csv 沒內容
    const initialData = obj.csv.trim() ? 
      obj.csv.trim().split("\n").map(r => r.split(",")) : 
      [
        ["年齡", "日期", "類別", "備註"],
        [20, "2025-01-01", "其他", "示例"],
        [100, "2025-01-01", "其他", "示例"]
      ];

    console.log("Initial CSV data:", initialData);

    // 延遲初始化 Handsontable
    const initInterval = setInterval(() => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.log("Container not found yet for Handsontable:", containerId);
        return;
      }

      console.log("Container found, initializing Handsontable:", containerId);

      clearInterval(initInterval);

      const hot = new Handsontable(container, {
        data: initialData,
        rowHeaders: true,
        colHeaders: true,
        licenseKey: "non-commercial-and-evaluation",
        contextMenu: true,
        filters: true,
        columnSorting: true,
        stretchH: "all",
        afterChange: (changes, source) => {
          if (source === "loadData") return;
          const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
          obj.csv = updatedCSV;
          console.log(`Updated CSV for ${containerId}:`, obj.csv);
        }
      });

    }, 50);

    return `<div id="${containerId}" style="height: 300px;"></div>`;
  }
});