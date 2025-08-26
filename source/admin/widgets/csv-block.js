console.log("✅ csv-block-iframe 已載入！");

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "string" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: (match) => ({ csv: match[1] || "" }),
  toBlock: (obj) => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: function (obj) {
    const iframeId = "csv-iframe-" + Math.random().toString(36).substr(2, 9);

    // iframe HTML
    const html = `<iframe id="${iframeId}" src="/admin/widgets/csv-editor.html" style="width:100%; height:350px; border:1px solid #ccc;"></iframe>`;

    // 傳遞 CSV 初始資料給 iframe
    setTimeout(() => {
      const iframe = document.getElementById(iframeId);
      if (!iframe) return;

      iframe.onload = () => {
        console.log("iframe loaded:", iframeId);

        // 送入初始 CSV
        const defaultCSV = "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
        const csvData = obj.csv || defaultCSV;

        iframe.contentWindow.postMessage(
          { type: "initCSV", csv: csvData },
          "*"
        );

        // 接收 iframe 內更新的 CSV
        window.addEventListener("message", (event) => {
          if (event.source !== iframe.contentWindow) return;
          if (event.data.type === "updateCSV") {
            obj.csv = event.data.csv;
            console.log("Updated CSV from iframe:", obj.csv);
          }
        });
      };
    }, 0);

    return html;
  },
});
