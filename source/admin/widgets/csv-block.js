var CSVEditorControl = createClass({
  render: function () {
    const containerId = `csv-editor-${this.props.forID}`;
    return h("div", { id: containerId, style: { width: "100%", minHeight: "300px" } });
  },

  componentDidMount: function () {
    const container = document.getElementById(`csv-editor-${this.props.forID}`);
    if (!container) return;

    // ====== 工具函式 ======
    function arrayToObjects(data, headers) {
      return data.map((r) => {
        const o = {};
        headers.forEach((h, i) => (o[h] = r[i] ?? ""));
        return o;
      });
    }

    function inferColumns(headers) {
      const genderList = ["其他", "男", "女"];
      const isAge = (h) => /^(年齡|年龄|age)$/i.test(h.trim());
      const isDate = (h) => /^(日期|date)$/i.test(h.trim());
      const isGender = (h) => /^(類別|類别|gender)$/i.test(h.trim());
      return headers.map((h) => {
        if (isAge(h)) {
          return {
            data: h,
            type: "numeric",
            validator: (v, cb) => cb(v === "" || (Number.isInteger(Number(v)) && Number(v) > 0)),
            allowInvalid: false,
          };
        }
        if (isDate(h)) {
          return {
            data: h,
            type: "date",
            dateFormat: "YYYY-MM-DD",
            correctFormat: true,
            validator: (v, cb) => cb(v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v)),
            allowInvalid: false,
          };
        }
        if (isGender(h)) {
          return { data: h, type: "dropdown", source: genderList, strict: false, allowInvalid: false };
        }
        return { data: h, type: "text" };
      });
    }

    // ====== 初始表格 ======
    const initialData = this.props.value && Array.isArray(this.props.value) ? this.props.value : [];
    const headers = initialData[0] ? Object.keys(initialData[0]) : ["Column 1"];
    const columns = inferColumns(headers);

    const hot = new Handsontable(container, {
      data: initialData,
      columns,
      colHeaders: headers,
      rowHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      dropdownMenu: true,
      filters: true,
      columnSorting: true,
      manualColumnResize: true,
      manualRowResize: true,
      autoWrapRow: false,
      undo: true,
      copyPaste: true,
      stretchH: "all",
      afterChange: (changes, source) => {
        if (source !== "loadData") {
          this.props.onChange(hot.getSourceData());
        }
      },
    });

    this.hot = hot;

    // ====== Widget 工具 API ======
    this.loadCSV = (text, hasHeader = true) => {
      Papa.parse(text, {
        header: hasHeader,
        skipEmptyLines: "greedy",
        complete: (res) => {
          if (hasHeader) {
            const fields = res.meta.fields || [];
            hot.updateSettings({ data: res.data, columns: inferColumns(fields), colHeaders: fields });
          } else {
            const rows = res.data || [];
            if (!rows.length) return;
            const hdrs = rows[0].map((_, i) => `Column ${i + 1}`);
            hot.updateSettings({ data: arrayToObjects(rows, hdrs), columns: inferColumns(hdrs), colHeaders: hdrs });
          }
        },
      });
    };

    this.exportCSV = () => {
      const dataObjs = hot.getSourceData();
      const hdrs = hot.getColHeader();
      const csv = Papa.unparse(dataObjs, { columns: hdrs });
      return "\uFEFF" + csv;
    };

    this.exportJSON = () => JSON.stringify(hot.getSourceData(), null, 2);

    this.addRow = () => {
      const newRow = {};
      hot.getColHeader().forEach((h) => (newRow[h] = ""));
      hot.updateSettings({ data: [...hot.getSourceData(), newRow] });
    };

    this.removeRow = () => {
      const data = hot.getSourceData();
      const sel = hot.getSelectedLast();
      const rowIndex = sel ? sel[0] : data.length - 1;
      data.splice(rowIndex, 1);
      hot.updateSettings({ data });
    };

    this.addCol = (name = null, type = "text", defaultValue = "") => {
      const colName = name || `Column ${hot.countCols() + 1}`;
      const headers = hot.getColHeader();
      const cols = hot.getSettings().columns;
      const data = hot.getSourceData();

      data.forEach((row) => (row[colName] = defaultValue));

      let colSetting = { data: colName, type };
      if (type === "dropdown") colSetting.source = [];
      if (type === "numeric") colSetting.validator = (v, cb) => cb(v === "" || Number.isFinite(Number(v)));
      if (type === "date") {
        colSetting.dateFormat = "YYYY-MM-DD";
        colSetting.correctFormat = true;
        colSetting.validator = (v, cb) => cb(v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v));
      }

      headers.push(colName);
      cols.push(colSetting);
      hot.updateSettings({ colHeaders: headers, columns: cols, data });
    };

    this.removeCol = () => {
      const sel = hot.getSelectedLast();
      const colIndex = sel ? sel[1] : hot.countCols() - 1;
      if (colIndex >= 0) {
        const headers = hot.getColHeader();
        const cols = hot.getSettings().columns;
        const data = hot.getSourceData();
        data.forEach((row) => delete row[headers[colIndex]]);
        headers.splice(colIndex, 1);
        cols.splice(colIndex, 1);
        hot.updateSettings({ colHeaders: headers, columns: cols, data });
      }
    };
  },
});

CMS.registerWidget("csv_editor", CSVEditorControl);
