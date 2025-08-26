console.log("✅ csv-block-debug 完整版本已載入！");

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "string" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: (match) => ({ csv: match[1] || "" }),
  toBlock: (obj) => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: function (obj, previewProps) {
    // 產生唯一 containerId
    const containerId = "csv-preview-" + Math.random().toString(36).substr(2, 9);

    // 預設 CSV 資料
    const defaultCSV = "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    obj.csv = obj.csv || defaultCSV;

    // 回傳 HTML
    const html = `<div id="${containerId}" style="height: 300px;"></div>`;

    // 等 DOM 插入 iframe 後初始化 Handsontable
    setTimeout(() => {
      let container;
      // 嘗試在 iframe container 中找到元素
      if (previewProps && previewProps.previewContainer) {
        container = previewProps.previewContainer.querySelector(`#${containerId}`);
      } else {
        container = document.getElementById(containerId);
      }

      if (!container) {
        console.warn("Container not found for Handsontable:", containerId);
        return;
      }

      console.log("Initializing Handsontable, containerId:", containerId);

      const data = obj.csv.trim().split("\n").map((r) => r.split(","));
      console.log("Initial CSV data:", data);

      const hot = new Handsontable(container, {
        data: data,
        rowHeaders: true,
        colHeaders: true,
        licenseKey: "non-commercial-and-evaluation",
        contextMenu: true,
        filters: true,
        columnSorting: true,
        stretchH: "all",
        afterChange: (changes, source) => {
          if (source === "loadData") return; // 避免初始化時觸發
          const updatedCSV = hot.getData().map((r) => r.join(",")).join("\n");
          obj.csv = updatedCSV;
          console.log("Updated CSV:", updatedCSV);
        },
      });
    }, 0);

    return html;
  },
});
