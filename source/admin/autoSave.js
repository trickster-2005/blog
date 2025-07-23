// this script allow user to type "ctrl+s" to save the draft instead of click save button

// 因為是動態載入class 不固定只能用內文方式找
function findSaveButton() {
  const buttons = document.querySelectorAll("button");
  for (const btn of buttons) {
    if (btn.innerText.trim() === "Save" && !btn.disabled) {
      return btn;
    }
  }
  return null;
}

document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    const saveButton = findSaveButton();
    if (saveButton) {
      saveButton.click();
      console.log("Triggered save via Ctrl+S");
    } else {
      console.log("Save button is disabled or not found");
    }
  }
});
