CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [
    {
      name: "csv",
      label: "CSV 內容",
      widget: "text",
      default: "name,age\nAlice,23\nBob,30",
    },
  ],
  // Markdown 文字中的樣子
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: function (match) {
    return { csv: match[1] };
  },
  toBlock: function (obj) {
    return "```csv\n" + (obj.csv || "") + "\n```";
  },
  toPreview: function (obj) {
    if (!obj.csv) return "<em>(空表格)</em>";
    const rows = obj.csv.trim().split("\n").map((r) => r.split(","));
    return `
      <table border="1" style="border-collapse:collapse;">
        <tbody>
          ${rows
            .map(
              (r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  },
});