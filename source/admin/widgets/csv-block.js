console.log("✅ csv-block-no-react 基本版本已載入！");

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
    console.log("Initial CSV data:", obj.csv);

    // 延遲初始化表格
    setTimeout(() => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn("Container not found for Handsontable:", containerId);
        return;
      }

      const data = obj.csv.trim()
        ? obj.csv.trim().split("\n").map(r => r.split(","))
        : [
            ["範例1", "範例2", "範例3"],
            ["資料A", "資料B", "資料C"]
          ];

      console.log("Initializing Handsontable with data:", data);

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
          if (!changes) return;

          const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
          obj.csv = updatedCSV;

          console.log("afterChange triggered, source:", source);
          console.log("Updated CSV:", updatedCSV);
        }
      });
    }, 0);

    return `<div id="${containerId}" style="height: 300px;"></div>`;
  }
});
