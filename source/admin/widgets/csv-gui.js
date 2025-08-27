// -------- Tabulator Editor Component --------
CMS.registerEditorComponent({
  id: "tabulator-table",
  label: "Tabulator Table",
  fields: [
    {
      name: "json",
      label: "表格資料 (JSON)",
      widget: "text",
    },
  ],
  pattern: /^<tabulator>(.*?)<\/tabulator>$/ms,
  fromBlock: function (match) {
    return {
      json: match[1],
    };
  },
  toBlock: function (data) {
    return `<tabulator>${data.json}</tabulator>`;
  },
  toPreview: function (data) {
    // 建立預覽區塊
    let wrapper = document.createElement("div");
    wrapper.style.border = "1px solid #ccc";
    wrapper.style.minHeight = "150px";

    try {
      const json = JSON.parse(data.json);
      new Tabulator(wrapper, {
        columns: json.columns || [],
        data: json.data || [],
        layout: "fitColumns",
        height: "200px",
      });
    } catch (e) {
      wrapper.textContent = "⚠️ JSON 格式錯誤，無法預覽";
    }

    return wrapper;
  },
});
