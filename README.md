# WhatsApp Web Tab
Unofficial Whatsapp Web add-on for Thunderbird, it adds a button that opens a WhatsApp Web tab in Thunderbird.
The [home page](https://addons.mozilla.org/thunderbird/addon/thunderwhatsappweb/) of the extension contains some pictures and reviews.

#### Installing 
A new WhatsApp Web icon should appear in the top-right corner of Thunderbird. Click to open.

#### Installing from sources
Download the repository, zip it, rename it to WhatsApp-Web-Tab.xpi and choose install addon from file in Thunderbird.

In linux the xpi file can be created with the following commands
* `git clone https://github.com/feranick/Thunderbird-WhatsApp-Web-Tab`
* `cd ./Thunderbird-WhatsApp-Web-Tab`
* `VERSION=$(cat ./manifest.json | jq --raw-output '.version')`
* `zip -r "../WhatsApp-Web-Tab-${VERSION}-tb.xpi" *`
