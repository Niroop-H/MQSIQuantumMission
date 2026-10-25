# MQSI International Quantum Mission

A polished, single-page website for the MQSI International Quantum Mission, led by the MQSI Advanced Research Community and powered by MAH Quantum.

## Run locally

Requires Node.js 18 or later.

```bash
npm run dev
```

Open http://localhost:3000.

## Build and production

```bash
npm run build
npm start
```

The project has no runtime npm dependencies. `npm run build` copies the static website into `dist/`; `npm start` serves `dist/` in production when it exists, otherwise it serves `public/`.

## Deploy

Deploy as a standard Node.js project on a Node-enabled hosting provider. Set the start command to `npm start` and ensure the host runs `npm run build` during its build step. Configure the host's Node version to 18 or newer.

## Programme notes

- Institutional subscription: US$500 per year.
- IBM independently controls Classroom Account eligibility, approval, hardware allocation and access conditions. The Mission does not guarantee that any institution will be approved.
- IBM's current Classroom Accounts page describes educator-led groups of 5–100 students, 10 minutes of QPU usage per student per 28-day rolling window and a 365-day validity period. Check IBM's official terms before applying.
- Students and individual researchers may join the MQSI Advanced Research Community WhatsApp group without paying the institutional subscription.
