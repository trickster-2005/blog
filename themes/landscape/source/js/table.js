// document.querySelectorAll("tabulator").forEach(el => {
//   let data = [];
//   try {
//     data = JSON.parse(el.textContent);
//   } catch(e) {
//     data = [];
//   }

//   const container = document.createElement("div");
//   el.replaceWith(container);

//   new Tabulator(container, {
//     data: data,
//     layout: "fitColumns",
//     columns: [
//       { title: "Name", field: "name" },
//       { title: "Age", field: "age" },
//       { title: "Email", field: "email" }
//     ]
//   });
// });