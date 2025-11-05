# Server — Setup & Run (MAKFR)

This document explains how to set up and run the server portion of the MAKFR project on Windows (PowerShell). It includes environment requirements, required files, how to start the server, and how to test the main endpoints.

## Requirements

- Node.js (v14+ recommended) and npm
- PowerShell (instructions below are tailored for PowerShell)
- The Firebase Admin service account JSON file: `makfr-hacc-firebase-adminsdk-fbsvc.json` placed inside the `server/` folder
- Optional: a Gemini API key set in environment variables if you want to use the Gemini endpoints

## Files of interest

- `server/server.js` — Express app and API endpoints
- `server/config.js` — Firebase initialization and helper `getUserDataByEmail`
- `server/makfr-hacc-firebase-adminsdk-fbsvc.json` — Firebase service account (must be present)

## Setup

From the repository root in PowerShell:

```powershell
cd .\server
npm install
```

Create a `.env` file in the `server/` directory (or set environment variables another way). Minimal example:

```
GEMINI_API_KEY=your_gemini_api_key_here
# Add other env vars as needed
```

Important: the code currently `require()`s the service account JSON at `./makfr-hacc-firebase-adminsdk-fbsvc.json`. Ensure that file exists in the `server/` directory and is not committed to public source control. Keep it secure.

## Start the server

From the `server/` folder:

```powershell
# start server directly
node .\server.js
```

By default the server listens on port `3000` (see `server.js`). If you want to run it with an automatic restart on change, install `nodemon` and run `nodemon server.js`.

## Endpoints & Quick Tests

Use PowerShell's `Invoke-RestMethod` or `curl` (alias) to test.

1) Add a user (POST /create)

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/create' -ContentType 'application/json' -Body (
@{ name = 'Test User'; email = 'test@example.com' } | ConvertTo-Json
)
```

2) Get user by email (GET /user?email=...)

Successful request example (replace with an email present in Firestore):

```powershell
Invoke-RestMethod -Method Get -Uri 'http://localhost:3000/user?email=test@example.com'
```

If the `email` query parameter is missing or empty the server will return HTTP 400 and a JSON error. This prevents sending `undefined` values to Firestore.

3) Gemini text generation (POST /api/gemini-text)

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/gemini-text' -ContentType 'application/json' -Body (
@{ prompt = 'Write a short poem about code' } | ConvertTo-Json
)
```

4) Gemini text+image generation (POST /api/gemini-text-image)

Send JSON with `prompt` and `image` (base64 string). Example (very large payloads are possible):

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/gemini-text-image' -ContentType 'application/json' -Body (
@{ prompt = 'Describe this image'; image = 'data:image/png;base64,<BASE64_DATA>' } | ConvertTo-Json
)
```

## Troubleshooting

- Error: "Value for argument \"value\" is not a valid query constraint. Cannot use \"undefined\" as a Firestore value."
  - Cause: passing `undefined` into `User.where('email','==', someValue)` (Firestone rejects undefined in query constraints).
  - Fix implemented: `server/config.js` now validates the `email` parameter and returns `null` for invalid input; the `/user` route in `server/server.js` validates `req.query.email` and returns `400` if missing. Ensure clients pass a non-empty `email` parameter.

- Missing service account JSON
  - The server loads `./makfr-hacc-firebase-adminsdk-fbsvc.json` on startup. If that file is missing the server will log an explanatory error and exit. Place the correct JSON in the `server` folder.

## Security notes

- Do NOT commit `makfr-hacc-firebase-adminsdk-fbsvc.json` or `.env` with secrets to source control.
- Limit API keys and rotate them regularly. If using a production server, use a secure secrets manager and environment-specific configs.

## Next steps / recommendations

- Add a small test script (e.g., using `supertest`) to exercise `/create` and `/user` endpoints automatically.
- Use `nodemon` for local development.
- Consider enabling Firestore `ignoreUndefinedProperties` only if you must serialize objects with optional fields; for queries it's better to validate inputs as implemented.

---

If you want, I can also add a small `server/test-requests.ps1` script with example requests or add HTTP tests to the repo.
