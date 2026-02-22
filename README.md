## SweetTrip — Fleet Management Website (React + Vite)

SweetTrip is a fleet management system where **managers** create/assign trips and manage vehicles, and **drivers** view/update their assigned trips.

This repo is now a **web app** (Vite + React) and is ready to deploy on **Vercel**.

### Features

- **Role-based access**: managers/admins vs drivers (`src/roles/`)
- **Trips & Vehicles**: list/create/edit/details
- **Driver trip status updates** (with CMR upload requirement on completion)
- **Offline mode**
  - mutations queue in local storage and can be retried (`src/services/offline.ts`)
- **Local seed database**
  - app seeds from `public/api/db.json`
  - persisted in browser localStorage (`src/lib/sqlite/dataService.ts`)

### Tech stack

- **React 19**
- **Vite**
- **React Router**
- **MUI (Material UI)**
- **TanStack React Query**

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Build

```bash
npm run build
```

The production output is in `dist/`.

## Deploy to Vercel

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`

Client-side routing is handled via `vercel.json` rewrites.

## Login credentials (seeded)

These users come from `public/api/db.json`:

<!-- - **Manager**
  - Email: `operations@mdatransport.se`
  - Password: `Mdatransport123@`
- **Drivers**
  - Email: `sokol@driver.com`
  - Password: `sokolDriver1!`
  - (see more in `public/api/db.json`) -->

