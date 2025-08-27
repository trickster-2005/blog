// 解構 React hooks
const { useState, useEffect, useRef } = React;

// 後台編輯用 Control Component
function CSVControl({ value = [], onChange, forID, classNameWrapper }) {
  const tableRef = useRef(null);
  const [data, setData] = useState(value.length ? value : [{ A: '', B: '' }]);

  // 初始化 Tabulator
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

  // 新增列
  const addRow = () => {
    const newRow = {};
    if (data[0]) Object.keys(data[0]).forEach((k) => (newRow[k] = ""));
    const newData = [...data, newRow];
    setData(newData);
    onChange(newData);
  };

  // 新增欄位
  const addColumn = () => {
    const colName = prompt("輸入欄位名稱");
    if (!colName) return;
    const newData = data.map((r) => ({ ...r, [colName]: "" }));
    setData(newData);
    onChange(newData);
  };

  return React.createElement(
    "div",
    { className: classNameWrapper, id: forID },
    React.createElement("div", { ref: tableRef }),
    React.createElement(
      "button",
      { type: "button", onClick: addRow, style: { margin: "5px" } },
      "新增列"
    ),
    React.createElement(
      "button",
      { type: "button", onClick: addColumn, style: { margin: "5px" } },
      "新增欄"
    )
  );
}

// 前台預覽用 Preview Component
function CSVPreview({ value = [] }) {
  if (!value.length) return React.createElement("div", null, "無資料");

  const columns = Object.keys(value[0]).map((k) => ({ title: k, field: k }));

  return React.createElement("div", {
    ref: (el) => {
      if (!el) return;
      new Tabulator(el, {
        data: value,
        columns,
        layout: "fitDataStretch",
        reactiveData: false,
      });
    },
  });
}

// 註冊 Widget
CMS.registerWidget("csv", CSVControl, CSVPreview);
