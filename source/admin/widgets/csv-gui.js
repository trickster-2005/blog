CMS.registerEditorComponent({
  id: "tabulator-block",
  label: "Interactive Table",
  fields: [
    {
      name: "data",
      label: "Table Data (JSON)",
      widget: "text"
    }
  ],
  pattern: /^<tabulator>([\s\S]*?)<\/tabulator>$/m,
  fromBlock: function (match) {
    return { data: match[1] };
  },
  toBlock: function (obj) {
    return `<tabulator>${obj.data}</tabulator>`;
  },
  toPreview: function (obj, getAsset, fields) {
    let data = [];
    try {
      data = JSON.parse(obj.data);
    } catch (e) {
      data = [{ name: "Sample", age: 20, email: "test@example.com" }];
    }

    // 容器
    const container = document.createElement("div");
    container.style.height = "250px";
    container.style.border = "1px solid #ddd";

    setTimeout(() => {
      const table = new Tabulator(container, {
        data: data,
        layout: "fitColumns",
        reactiveData: true, // 確保即時更新
        columns: [
          { title: "Name", field: "name", editor: "input" },
          { title: "Age", field: "age", editor: "number" },
          { title: "Email", field: "email", editor: "input" }
        ]
      });

      // 🔑 重點：監聽變更，回寫到 Markdown JSON
      table.on("dataChanged", function (updatedData) {
        // 直接更新 Decap CMS 的值
        obj.data = JSON.stringify(updatedData);
        // 這邊會觸發同步到 <tabulator>JSON</tabulator>
        const field = fields.find(f => f.get("name") === "data");
        if (field && field.onChange) {
          field.onChange(obj.data);
        }
      });
    }, 50);

    return container;
  }
});
