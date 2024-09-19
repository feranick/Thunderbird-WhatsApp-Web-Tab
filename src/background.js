const is_release = true;

function debug_msg(message){
  if(is_release){
    return;
  }
  console.debug("WhatsApp-Web-Tab: " + message);
}

debug_msg("Loading");

browser.webRequest.onBeforeSendHeaders.addListener(
  function(e) {
    e.requestHeaders.forEach(header => {
      if (header.name.toLowerCase() === "user-agent") {
        header.value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0";
      }
    });
    return { requestHeaders: e.requestHeaders };
  },
  { urls: ["https://web.whatsapp.com/*"] },
  ["blocking", "requestHeaders"]
);


function openNewTab(tab_url){
  debug_msg(`Opening tab with url: ${tab_url}`);
  browser.tabs.create({ url: tab_url });
}

if ("browserAction" in browser) {
  debug_msg("Has permision for browserAction");

  browser.browserAction.onClicked.addListener(async () => {
    openNewTab("https://web.whatsapp.com/");
  });
} else {
  openNewTab("https://web.whatsapp.com/");
}



debug_msg("Loaded");
