# MockCRUD

**Instant mock REST APIs — no setup, always live.**

MockCRUD lets you define data resources and generates a fully hosted CRUD API in seconds. No servers, no config, no waiting.

🌐 **Live app:** [mockcrud.xyz](https://mockcrud.xyz)
⚙️ **Backend repo:** [AhmedKhawar/mockCRUD-backend](https://github.com/AhmedKhawar/mockCRUD-backend)

---

## Table of Contents

- [How It Works](#how-it-works)
- [Resource Builder](#resource-builder)
- [Link & Auth Toggles](#link--auth-toggles)
- [Live Endpoints](#live-endpoints)
- [Project Limits](#project-limits)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## How It Works

1. **Create a project.** Sign up and create a project. Each project gets a unique **slug**, used in all of its API URLs.
2. **Add resources**, manually or with AI, through the Resource Builder.
3. **Turn on Link and/or Auth** for any resource that needs them.
4. **Get live endpoints** the moment you create a resource. No deploy step, no waiting.

---

## Resource Builder

Every resource is built in one of two modes:

### ✏️ Manual Builder

Type the resource name (for example `users`, `products`), then add fields yourself:

- Set a field name (for example `email`, `price`)
- Choose a type: String, Number, Boolean, Date, Array, Object, and more
- Mark fields as **Required** with the checkbox

> **Note:** don't add an `id` field yourself. MongoDB generates `_id` automatically for every record, and the API returns it as `id`.

### ⚡ Infer Fields (AI)

Toggle **Infer fields** on any resource and let AI generate the schema for you. Optionally set how many fields you want, from 1 to 8. AI infers realistic, contextually appropriate fields based on the resource name.

---

## Link & Auth Toggles

Each resource card has a control bar with two toggles:

| Toggle   | What it does                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Link** | Enables AI-powered relational linking. When any resource in the batch has Link on, AI scans all the resources together and injects logical foreign keys, for example `hospitalId` into a `doctors` resource. Unrelated resources are left untouched. |
| **Auth** | Requires a valid JWT on all endpoints for that resource. Turning Auth on for any resource in your project unlocks the **Auth API panel**, with signup, login and logout endpoints for managing user sessions. |

---

## Live Endpoints

Once created, every resource is immediately live at:

```
GET     https://mock-crud-backend.vercel.app/m/{slug}/{resource}
GET     https://mock-crud-backend.vercel.app/m/{slug}/{resource}/:id
POST    https://mock-crud-backend.vercel.app/m/{slug}/{resource}
PUT     https://mock-crud-backend.vercel.app/m/{slug}/{resource}/:id
DELETE  https://mock-crud-backend.vercel.app/m/{slug}/{resource}/:id
```

Hit them with Postman, curl, or your own frontend — they work instantly.

### Example

```bash
curl -X POST https://mock-crud-backend.vercel.app/m/my-project/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Desk Lamp", "price": 24.99}'
```

```json
{
  "id": "665f1c2e8b3a4d0012ab34cd",
  "name": "Desk Lamp",
  "price": 24.99
}
```

That same `id` is used for `GET /:id`, `PUT /:id` and `DELETE /:id`.

---

## Project Limits

- Up to **5 resources** per creation batch
- Up to **8 fields** per resource

---

## Tech Stack

| Area      | Technology                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Frontend  | React + Vite, deployed on Vercel                                                                     |
| Backend   | Node.js + Express + MongoDB, deployed on Vercel                                                     |
| AI        | Google Gemini Flash — handles field inference, entity validation and relational linking in a single unified pass |
| Auth      | JWT-based, per-resource toggle                                                                       |

---

## Project Structure

```
mockCRUD/
├── public/           # Static assets
├── src/              # Application source (components, pages, styles)
├── index.html        # HTML entry point
├── vite.config.js    # Vite configuration
├── vercel.json       # Vercel deployment config
├── .oxlintrc.json    # Linter configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- A recent Node.js LTS (20.19+ or 22.12+)
- A running instance of the [MockCRUD backend](https://github.com/AhmedKhawar/mockCRUD-backend), or use the hosted one
- A Google OAuth client ID (for sign-in)

### Installation

```bash
git clone https://github.com/AhmedKhawar/mockCRUD.git
cd mockCRUD
npm install
```

### Environment variables

Create a `.env` file in the project root. The names below are examples, so match them to the ones your code reads:

```env
VITE_API_URL=https://mock-crud-backend.vercel.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Run locally

```bash
npm run dev
```

Then open the URL Vite prints, usually `http://localhost:5173`.

---

## Scripts

| Command           | Description                        |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start the dev server with HMR       |
| `npm run build`   | Create a production build           |
| `npm run preview` | Preview the production build        |
| `npm run lint`    | Lint the code with Oxlint           |

---

## Deployment

The app is set up for [Vercel](https://vercel.com) through `vercel.json`. Connect the repository, add the environment variables in your Vercel project settings, and deploy.

---

## Related

- **Backend:** [mockCRUD-backend](https://github.com/AhmedKhawar/mockCRUD-backend) (Express, MongoDB, Gemini)

---

## Author

Built by [@AhmedKhawar](https://github.com/AhmedKhawar).
