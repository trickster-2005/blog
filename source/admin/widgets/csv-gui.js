const { useState, useEffect, useRef } = React;

// Control Component (後台編輯)
function CSVControl({ value = [], onChange, forID, classNameWrapper }) {
  const tableRef = useRef(null);
  const [data, setData] = useState(value);

  useEffect(() => {
    if (!tableRef.current) return;

    const table = new Tabulator(tableRef.current, {
      data: data,
      reactiveData: true,
      layout: "fitDataStretch",
      columns: data[0] ? Object.keys(data[0]).map(k => ({ title: k, field: k, editor: "input" })) : [],
      cellEdited: () => onChange(data),
    });

    return () => table.destroy();
  }, [tableRef, data]);

  const addRow = () => {
    const newRow = {};
    if (data[0]) Object.keys(data[0]).forEach(k => newRow[k] = "");
    setData([...data, newRow]);
  };

  const addColumn = () => {
    const colName = prompt("輸入欄位名稱");
    if (!colName) return;
    const newData = data.map(r => ({ ...r, [colName]: "" }));
    setData(newData);
  };

  return (
    <div className={classNameWrapper} id={forID}>
      <div ref={tableRef}></div>
      <button type="button" onClick={addRow}>新增列</button>
      <button type="button" onClick={addColumn}>新增欄</button>
    </div>
  );
}

// Preview Component (前台只讀)
function CSVPreview({ value = [] }) {
  if (!value.length) return <div>無資料</div>;

  const columns = Object.keys(value[0]).map(k => ({ title: k, field: k }));
  
  return <div id="csv-preview" ref={el => {
    if (!el) return;
    new Tabulator(el, { data: value, columns, layout: "fitDataStretch", reactiveData: false });
  }}></div>;
}

// 註冊 Widget
CMS.registerWidget("csv", CSVControl, CSVPreview);