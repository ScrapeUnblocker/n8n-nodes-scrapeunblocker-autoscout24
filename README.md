# n8n-nodes-scrapeunblocker-autoscout24

This is an n8n community node. It lets you search **AutoScout24 car listings** from eight European countries in your n8n workflows and get them as JSON: make and model, price, mileage, first registration, fuel, gearbox, power, location, seller and images.

The node runs the [AutoScout24 Car Scraper](https://apify.com/scrapeunblocker/autoscout24-scraper) Actor by ScrapeUnblocker on the [Apify](https://apify.com) platform with **your own Apify account**, waits for the run to finish and returns every scraped record as an n8n item.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Credentials](#credentials)
[Operations](#operations)
[Output](#output)
[Example workflow](#example-workflow)
[Pricing](#pricing)
[Compatibility](#compatibility)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The npm package name is `n8n-nodes-scrapeunblocker-autoscout24`.

## Credentials

The node authenticates with an **Apify API token**. Every run starts on the Apify account that owns the token and is billed to that account (see [Pricing](#pricing)).

### 1. Create an Apify account (skip if you already have one)

1. Go to [console.apify.com/sign-up](https://console.apify.com/sign-up) and sign up with email, Google or GitHub.
2. Confirm your email address if Apify asks you to.

The free Apify plan needs no credit card and includes a monthly usage credit, which is enough to try the node. Current plan limits are listed on [apify.com/pricing](https://apify.com/pricing).

### 2. Get your API token

1. Open [Apify Console](https://console.apify.com) and go to **Settings** → **API & Integrations**, or open [console.apify.com/settings/integrations](https://console.apify.com/settings/integrations) directly.
2. Find the **Personal API tokens** section.
3. Either use the existing token (the one marked *Default API token created on sign up*): click the eye icon to reveal it or the copy icon to copy it.
4. Or create a dedicated token for n8n (recommended, so you can revoke it without affecting anything else):
   1. Click **+ Add new token** (the button may read **Create new token**).
   2. In the **Create a new personal API token** dialog, enter a **Description** such as `n8n`.
   3. Optionally switch on **Set expiration date** and pick a date.
   4. Leave **Limit token permissions** switched off. A token with limited permissions may not be allowed to run this Actor or read its results.
   5. Click **Create** and copy the new token.

The token starts with `apify_api_`. Treat it like a password: anyone who has it can run Actors on your account. You can revoke or rotate it on the same page at any time.

> Working in an Apify **organization**? Switch to the organization in Apify Console first and copy a token from its **API & Integrations** page, so runs are billed to the organization.

### 3. Add the credential in n8n

1. Add the **AutoScout24 Car Scraper** node to a workflow and open it.
2. In **Credential to connect with**, choose **Create new credential**. (You can also create an **Apify API** credential from the n8n credentials list.)
3. Paste the token into **API Key** and click **Save**. n8n checks the token right away; an invalid token shows *Authorization failed - please check your credentials*.

Already have an **Apify API** credential in n8n (for example from the official Apify node)? This node uses the same credential type, so you can simply select it.

## Operations

Pick a **Resource** and an **Operation**. Each n8n input item starts one Apify run. List fields accept several values separated by commas or new lines, or an array returned by an expression.

| Resource | Operation | Fields | Returns |
|---|---|---|---|
| **Listing** | Search | **Max Results** - How many listings to collect across pages (about 20 per page, up to 400) | One item per listing |

### Options

| Option | Description |
|---|---|
| **First Registration From (Year)** | Earliest year of first registration, e.g. 2018 |
| **First Registration To (Year)** | Latest year of first registration, e.g. 2022 |
| **Fuel** | Only cars with this fuel type |
| **Make** | Car make as written in AutoScout24 URLs, e.g. 'bmw', 'volkswagen' or 'mercedes-benz'. Leave empty for all makes. |
| **Max Mileage (Km)** | Highest mileage to include, in km |
| **Max Power** | Highest engine power, in the unit set by Power Unit |
| **Max Price (EUR)** | Highest price to include, in EUR |
| **Min Power** | Lowest engine power, in the unit set by Power Unit |
| **Min Price (EUR)** | Lowest price to include, in EUR |
| **Model** | Model as written in AutoScout24 URLs, e.g. 'x5' or 'golf'. Needs a make. |
| **Power Unit** | Unit of Min Power and Max Power |
| **Proxy Country** | Exit-IP country as an ISO-2 code (e.g. DE). Leave empty for an automatically chosen exit. |
| **Seller Country** | Only cars offered by sellers in this country |
| **Sort By** | Result ordering |
| **Transmission** | Only cars with this gearbox |
| **Timeout (Seconds)** | Maximum run time of the Apify run. `0` keeps the Actor default. A run that times out fails the node. |

### How a run works

1. The node starts the Actor on your Apify account with the fields you set.
2. It waits for the run to finish.
3. It returns every record from the run's dataset as a separate n8n item.

The run is also visible in Apify Console under **Runs**. If a run fails or times out, the node error links to the run log and tells you whether any results were saved before it stopped.

Stopping the n8n execution only stops the node from waiting: the Apify run keeps going and its results are still charged. To stop it, abort the run in Apify Console under **Runs**, and use **Timeout (Seconds)** to cap long runs up front.

### Use as an AI Agent tool

The node can be attached to an n8n **AI Agent** as a tool, so the agent can call it on its own.

## Output

- One item per car listing, with title, make, model, condition, price, mileage, first registration, fuel, transmission, power in kW and hp, engine size, location, seller and image URLs.

Fields of a returned item: `id`, `url`, `title`, `make`, `model`, `modelGroup`, `variant`, `condition`, `isNewListing`, `price`, `mileageKm`, `firstRegistration`, `fuel`, `transmission`, `powerKw`, `powerHp`, `engineCc`, `location`, `seller`, `images`.

Example item (shortened):

```json
{
  "id": "bbfdd781-4494-4411-9348-64976cce3bef",
  "url": "https://www.autoscout24.com/offers/bmw-x5-xdrive-50-i-m-sport-virtuelles-cock...",
  "title": "xDrive 50 i M Sport / Virtuelles Cockpit / Head-Up/360 Grad Kamera",
  "make": "BMW",
  "model": "X5",
  "modelGroup": "X5",
  "variant": "X5",
  "condition": "used",
  "isNewListing": false,
  "price": {
    "raw": 28990,
    "formatted": "€ 28,990",
    "label": "fair-price"
  },
  "mileageKm": 142899,
  "firstRegistration": "10/2016",
  "fuel": "Gasoline",
  "transmission": "Automatic",
  "...": "..."
}
```

## Example workflow

To try the node in a minute, copy the workflow below, paste it into the n8n editor (Ctrl+V / Cmd+V), open the **AutoScout24 Car Scraper** node, select your **Apify API** credential and click **Execute workflow**.

```json
{
  "nodes": [
    {
      "parameters": {},
      "name": "When clicking 'Execute workflow'",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        0,
        0
      ]
    },
    {
      "parameters": {
        "resource": "listing",
        "operation": "search",
        "maxResults": 5,
        "options": {
          "make": "bmw",
          "model": "x5"
        }
      },
      "name": "AutoScout24 Car Scraper",
      "type": "n8n-nodes-scrapeunblocker-autoscout24.autoScout24CarScraper",
      "typeVersion": 1,
      "position": [
        220,
        0
      ]
    }
  ],
  "connections": {
    "When clicking 'Execute workflow'": {
      "main": [
        [
          {
            "node": "AutoScout24 Car Scraper",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Pricing

The node itself is free. The Actor is paid per result on Apify: **$0.45 per 1,000 listings** plus a tiny start fee per run ($0.00005), charged to the Apify account of your token. Every item the node returns counts as one result. The current price is always shown on the [Actor page](https://apify.com/scrapeunblocker/autoscout24-scraper), and your spending is visible in Apify Console.

## Compatibility

Tested with n8n 2.40 (self-hosted).

## Resources

- [AutoScout24 Car Scraper Actor on Apify](https://apify.com/scrapeunblocker/autoscout24-scraper)
- [Apify API tokens documentation](https://docs.apify.com/platform/integrations/api#api-token)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ScrapeUnblocker](https://www.scrapeunblocker.com/?utm_source=n8n&utm_medium=integration&utm_campaign=n8n-autoscout24-node) - the anti-bot scraping API behind the Actor

## Version history

- 0.1.0: Initial release
- 0.1.1: First release published from GitHub Actions with an npm provenance statement
