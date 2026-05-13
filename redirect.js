browser.spacesToolbar.addButton('WhatsAppWeb', {
    title: "WhatsApp Web",
    defaultIcons: "skin/whatsapp_web_icon.svg",
    url: "https://web.whatsapp.com/"
});

browser.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (let header of details.requestHeaders) {
      if (header.name.toLowerCase() === "user-agent") {
        header.value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0";
        break;
      }
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["https://web.whatsapp.com/*", "https://*.whatsapp.com/*"] },
  ["blocking", "requestHeaders"]
);
