// --- 1. TOOLBAR BUTTON ---
browser.spacesToolbar.addButton('WhatsAppWeb', {
    title: browser.i18n.getMessage("toolbarButtonTitle"),
    defaultIcons: "skin/whatsapp_web_icon.svg",
    url: "https://web.whatsapp.com/"
});

// --- 2. USER-AGENT SPOOFING ---
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

// --- 3. CONTEXT MENUS ---

// Create the "Share Text" menu item
browser.menus.create({
  id: "share-to-whatsapp",
  title: browser.i18n.getMessage("contextMenuShareText"),
  contexts: ["selection"] 
});

// Create the "Chat with Number" menu item
browser.menus.create({
  id: "chat-on-whatsapp",
  title: browser.i18n.getMessage("contextMenuChatNumber"),
  contexts: ["selection"] 
});

// Listen for clicks on the context menus
browser.menus.onClicked.addListener((info, tab) => {
  
  // Logic for sharing highlighted text
  if (info.menuItemId === "share-to-whatsapp") {
    const selectedText = encodeURIComponent(info.selectionText);
    const targetUrl = `https://web.whatsapp.com/send?text=${selectedText}`;
    openOrUpdateWhatsApp(targetUrl);
  }
  
  // Logic for starting a chat with a highlighted number
  else if (info.menuItemId === "chat-on-whatsapp") {
    
    let rawText = info.selectionText.trim();
    
    // Check if the user explicitly highlighted a country code (+ or 00)
    let hasExplicitCountryCode = rawText.startsWith('+') || rawText.startsWith('00');
    
    // Strip out all non-numeric characters (removes the + and formatting)
    let phoneNumber = rawText.replace(/\D/g, ''); 
    
    if (phoneNumber.length > 0) {
      
      if (hasExplicitCountryCode) {
        // WhatsApp API prefers no leading '00' (e.g., 44 instead of 0044)
        if (phoneNumber.startsWith('00')) {
          phoneNumber = phoneNumber.substring(2); 
        }
      } else {
        // If no explicit code, calculate it based on locale
        const locale = navigator.language || "en-US";
        const region = locale.includes('-') ? locale.split('-')[1].toUpperCase() : 'US';

        const callingCodes = {
          'US': '1', 'IT': '39', 'CA': '1', 'GB': '44', 'FR': '33', 
          'DE': '49', 'ES': '34', 'IN': '91', 'BR': '55', 'MX': '52'
        };

        const countryCode = callingCodes[region] || '1'; 

        if (region === 'US' || region === 'CA') {
          if (phoneNumber.length === 10) phoneNumber = countryCode + phoneNumber;
        } else {
          if (phoneNumber.startsWith('0')) {
            phoneNumber = countryCode + phoneNumber.substring(1);
          } else {
            phoneNumber = countryCode + phoneNumber;
          }
        }
      }

      // Fire off the final URL
      const targetUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}`;
      openOrUpdateWhatsApp(targetUrl);
    }
  }
});

// --- 4. HELPER FUNCTION ---
// Manages tabs to ensure we don't open duplicate WhatsApp instances
function openOrUpdateWhatsApp(targetUrl) {
  browser.tabs.query({ url: "*://web.whatsapp.com/*" }).then((tabs) => {
    if (tabs.length > 0) {
      // Update existing tab and bring to foreground
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
