// --- 1. TOOLBAR BUTTON ---
browser.spacesToolbar.addButton('WhatsAppWeb', {
  title: browser.i18n.getMessage("toolbarButtonTitle"),
  defaultIcons: "skin/whatsapp_web_icon.svg",
  url: "https://web.whatsapp.com/"
});

// --- 2. USER-AGENT SPOOFING ---
browser.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    for (let header of details.requestHeaders) {
      if (header.name.toLowerCase() === "user-agent") {
        header.value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/151.0";
        break;
      }
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["https://web.whatsapp.com/*", "https://*.whatsapp.com/*"] },
  ["blocking", "requestHeaders"]
);

// --- 3. CONTEXT MENUS ---

browser.menus.create({
  id: "share-to-whatsapp",
  title: browser.i18n.getMessage("contextMenuShareText"),
  contexts: ["selection"]
});

browser.menus.create({
  id: "chat-on-whatsapp",
  title: browser.i18n.getMessage("contextMenuChatNumber"),
  contexts: ["selection"]
});

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
    let hasExplicitCountryCode = rawText.startsWith('+') || rawText.startsWith('00');
    let phoneNumber = rawText.replace(/\D/g, '');

    if (phoneNumber.length > 0) {

      if (hasExplicitCountryCode) {
        if (phoneNumber.startsWith('00')) {
          phoneNumber = phoneNumber.substring(2);
        }
      } else {
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
      browser.tabs.update(tabs[0].id, {
        active: true,
        url: targetUrl
      });
    } else {
      browser.tabs.create({
        url: targetUrl
      });
    }
  }).catch((error) => {
    console.error("Error querying tabs: ", error);
  });
}

// --- 5. WHATSAPP NOTIFICATION CODE ---
//
// WhatsApp Web badges its tab title with an unread count, e.g. "(3) WhatsApp".
// We notify when the count increases, and reset tracking when the title
// returns to a clean (read) state.

const whatsappState = new Map(); // tabId -> count

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.title && tab.url && tab.url.includes("web.whatsapp.com")) {
    const title = changeInfo.title;

    // TEMPORARY: confirm the real title format, then remove this.
    console.log("WhatsApp tab title:", JSON.stringify(title));

    const previousCount = whatsappState.get(tabId) || 0;

    // Look for a count anywhere in the title, e.g. "(3) WhatsApp"
    const match = title.match(/\((\d+)\+?\)/);
    const count = match ? parseInt(match[1], 10) : 0;

    if (count > previousCount) {
      const body = count === 1 ? "You have a new message."
                               : `You have ${count} new messages.`;
      browser.notifications.create("whatsapp-unread-alert", {
        type: "basic",
        iconUrl: "skin/whatsapp_web_icon.png",
        title: "WhatsApp",
        message: body
      }).catch((error) => {
        console.error("Failed to create notification:", error);
      });
    }

    whatsappState.set(tabId, count);
  }
});

// Clean up tracking when a tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  whatsappState.delete(tabId);
});

// Focus the WhatsApp tab when the notification is clicked
browser.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "whatsapp-unread-alert") {
    browser.tabs.query({ url: "*://web.whatsapp.com/*" }).then((tabs) => {
      if (tabs.length > 0) {
        browser.tabs.update(tabs[0].id, { active: true });
        if (tabs[0].windowId) {
          browser.windows.update(tabs[0].windowId, { focused: true });
        }
      }
    }).catch((error) => {
      console.error("Error focusing WhatsApp tab via notification click: ", error);
    });
  }
});
