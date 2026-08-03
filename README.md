# UniversalLimitless.com

The commercial hub for the Universal Limitless business ecosystem. This responsive landing page presents the company portfolio, sells packaged services, demonstrates the data-management offer, and converts visitors into qualified project inquiries.

## Run locally

No dependencies are required.

```sh
npm start
```

Open `http://127.0.0.1:4173`.

## Current product features

- Responsive desktop and mobile navigation
- Filterable agency ecosystem
- Service catalog with persistent project cart
- Data-management command-center presentation
- Project and monthly pricing views
- Accessible FAQ accordion
- Consultation flow with client-side validation
- Local inquiry draft storage for preview/testing
- Legal placeholders, reduced-motion support, and keyboard focus states

## Before production launch

The inquiry form intentionally does not transmit personal data yet. Connect it to the business CRM, email automation, or a secure API endpoint before deployment. Replace the privacy and terms placeholders with policies reviewed for the business and jurisdiction. Replace illustrative performance claims with verified case-study data as it becomes available.

## Structure

- `index.html` — semantic content and commerce structure
- `style.css` — responsive design system
- `script.js` — navigation, filtering, cart, pricing, dialogs, form, and FAQ interactions
- `server.mjs` — dependency-free local preview server
- `images/` — local production assets
