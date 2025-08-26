console.log("✅ csv-block-debug 基本版本已載入！");

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "string" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: (match) => ({ csv: match[1] || "" }),
  toBlock: (obj) => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: function (obj) {
    const containerId = "csv-preview-" + Math.random().toString(36).substr(2, 9);

    // 預設 CSV 資料
    const defaultCSV = "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    obj.csv = obj.csv || defaultCSV;

    const html = `<div id="${containerId}" style="height: 300px;"></div>`;

    // 等 DOM 元素生成後初始化 Handsontable
    const interval = setInterval(() => {
      const container = document.getElementById(containerId);
      if (!container) return;

      clearInterval(interval);
      console.log("Initializing Handsontable, containerId:", containerId);

      const data = obj.csv
        .trim()
        .split("\n")
        .map((r) => r.split(","));
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
        afterChange: () => {
          const updatedCSV = hot.getData().map((r) => r.join(",")).join("\n");
          obj.csv = updatedCSV;
          console.log("Updated CSV:", updatedCSV);
        },
      });
    }, 50);

    return html;
  },
});
