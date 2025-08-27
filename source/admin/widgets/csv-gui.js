const TabulatorPreview = ({ value, onChange }) => {
  const containerRef = React.useRef(null);
  const tableRef = React.useRef(null);

  React.useEffect(() => {
    let data = [];
    try {
      data = JSON.parse(value || "[]");
    } catch (e) {
      data = [];
    }

    tableRef.current = new Tabulator(containerRef.current, {
      data: data,
      layout: "fitColumns",
      reactiveData: true,
      columns: [
        { title: "Name", field: "name", editor: "input" },
        { title: "Age", field: "age", editor: "number" },
        { title: "Email", field: "email", editor: "input" }
      ]
    });

    // 監聽變更，回寫 Markdown JSON
    tableRef.current.on("dataChanged", (updatedData) => {
      if (onChange) onChange(JSON.stringify(updatedData));
    });

    return () => {
      if (tableRef.current) tableRef.current.destroy();
    };
  }, []);

  return React.createElement("div", {
    ref: containerRef,
    style: { height: "250px", border: "1px solid #ddd" }
  });
};

CMS.registerEditorComponent({
  id: "tabulator-block",
  label: "Interactive Table",
  fields: [
    { name: "data", label: "Table Data (JSON)", widget: "text" }
  ],
  // Markdown 中的 pattern，用來抓 <tabulator>...</tabulator>
  pattern: /^<tabulator>([\s\S]*?)<\/tabulator>$/m,
  fromBlock: match => ({ data: match[1] }),
  toBlock: obj => `<tabulator>${obj.data}</tabulator>`,
  toPreview: TabulatorPreview
});