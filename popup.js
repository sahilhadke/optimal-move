document.getElementById('loadBoard').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { type: "GET_BOARD" }, (response) => {
    document.getElementById("output").textContent = JSON.stringify(response, null, 2);
  });
});