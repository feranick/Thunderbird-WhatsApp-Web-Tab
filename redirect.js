// --- EXISTING CODE ---

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


// Create the context menu item
browser.menus.create({
  id: "share-to-whatsapp",
  title: "Share to WhatsApp",
  contexts: ["selection"] 
});

// Listen for clicks on the context menu
browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "share-to-whatsapp") {
    
    // Grab and safely encode the highlighted text
    const selectedText = encodeURIComponent(info.selectionText);
    const targetUrl = `https://web.whatsapp.com/send?text=${selectedText}`;

    // Check if WhatsApp is already open to avoid duplicate tabs
    browser.tabs.query({ url: "*://web.whatsapp.com/*" }).then((tabs) => {
      if (tabs.length > 0) {
        // Update existing tab
        browser.tabs.update(tabs[0].id, { 
          active: true, 
          url: targetUrl 
        });
      } else {
        // Open a new tab if it's not currently open
        browser.tabs.create({ 
          url: targetUrl 
        });
      }
    }).catch((error) => {
      console.error("Error querying tabs: ", error);
    });
  }
});
