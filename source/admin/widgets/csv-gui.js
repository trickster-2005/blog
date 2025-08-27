const { useState, useEffect, useRef } = React;
const h = React.createElement;

// Control Component (後台可互動編輯)
function CSVControl({ value = [], onChange, forID, classNameWrapper }) {
  const tableRef = useRef(null);
  const [data, setData] = useState(value);

  useEffect(() => {
    if (!tableRef.current) return;

    const table = new Tabulator(tableRef.current, {
      data: data,
      reactiveData: true,
      layout: "fitDataStretch",
      columns: data[0]
        ? Object.keys(data[0]).map((k) => ({
            title: k,
            field: k,
            editor: "input",
          }))
        : [],
      cellEdited: () => onChange(data),
    });

    return () => table.destroy();
  }, [tableRef, data]);

  const addRow = () => {
    const newRow = {};
    if (data[0]) Object.keys(data[0]).forEach((k) => (newRow[k] = ""));
    setData([...data, newRow]);
  };

  const addColumn = () => {
    const colName = prompt("輸入欄位名稱");
    if (!colName) return;
    const newData = data.map((r) => ({ ...r, [colName]: "" }));
    setData(newData);
  };

  return h(
    "div",
    { className: classNameWrapper, id: forID },
    h("div", { ref: tableRef }),
    h(
      "button",
      { type: "button", onClick: addRow, style: { marginRight: "5px" } },
      "新增列"
    ),
    h(
      "button",
      { type: "button", onClick: addColumn },
      "新增欄"
    )
  );
}

// Preview Component (前台只讀)
function CSVPreview({ value = [] }) {
  const previewRef = useRef(null);

  useEffect(() => {
    if (!previewRef.current) return;
    if (!value.length) return;

    new Tabulator(previewRef.current, {
      data: value,
      reactiveData: false,
      layout: "fitDataStretch",
      columns: Object.keys(value[0]).map((k) => ({ title: k, field: k })),
    });
  }, [previewRef, value]);

  return h("div", { ref: previewRef });
}

// 註冊 Widget
CMS.registerWidget("csv", CSVControl, CSVPreview);
