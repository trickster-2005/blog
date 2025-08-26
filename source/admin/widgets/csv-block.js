(function() {
  if (typeof CMS === "undefined") return;

  // Helper: convert Handsontable data to JSON
  function getTableData(hot) {
    return hot.getSourceData().map(r => {
      const obj = {};
      hot.getColHeader().forEach(h => obj[h] = r[h] ?? "");
      return obj;
    });
  }

  CMS.registerEditorComponent({
    id: "csv-table",
    label: "CSV Table",
    fields: [
      { name: "data", label: "Table Data (JSON)", widget: "text" }
    ],

    pattern: /^:::csv-table\s+([\s\S]*?):::/m,

    fromBlock: function(match) {
      let data = [];
      try { data = JSON.parse(match[1]); } catch(e) {}
      return { data: JSON.stringify(data, null, 2) };
    },

    toBlock: function(data) {
      return `:::csv-table
${data.data}
:::`;
    },

    toPreview: function(data) {
      let tableData = [];
      try { tableData = JSON.parse(data.data); } catch(e) {}
      if (!tableData.length) return CMS.h("p", {}, "Empty table");

      const headers = Object.keys(tableData[0]);
      return CMS.h("table", {style: {border:"1px solid #ccc", borderCollapse:"collapse"}},
        CMS.h("thead", {},
          CMS.h("tr", {}, headers.map(h => CMS.h("th",{style:{border:"1px solid #ccc",padding:"4px"}},h)))
        ),
        CMS.h("tbody", {},
          tableData.map(row => CMS.h("tr", {}, headers.map(h => CMS.h("td",{style:{border:"1px solid #ccc",padding:"4px"}}, row[h] || ""))))
        )
      );
    },

    control: function({ value, onChange, forID, classNameWrapper }) {
      const container = document.createElement("div");
      container.id = forID;
      container.className = classNameWrapper;
      container.style.width = "100%";
      container.style.minHeight = "200px";

      let tableData = [];
      try { tableData = JSON.parse(value || "[]"); } catch(e) {}

      const headers = tableData[0] ? Object.keys(tableData[0]) : ["Column 1"];
      const hot = new Handsontable(container, {
        data: tableData,
        columns: headers.map(h => ({ data: h, type: "text" })),
        colHeaders: headers,
        rowHeaders: true,
        licenseKey: "non-commercial-and-evaluation",
        contextMenu: true,
        dropdownMenu: true,
        filters: true,
        columnSorting: true,
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: true,
        manualRowMove: true,
        autoWrapRow: false,
        undo: true,
        copyPaste: true,
        stretchH: "all"
      });

      // 每次編輯更新 value
      hot.addHook("afterChange", () => {
        onChange(JSON.stringify(getTableData(hot), null, 2));
      });

      return container;
    }
  });
})();
