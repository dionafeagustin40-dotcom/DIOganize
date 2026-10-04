# DIOganize

DIOganize is a React/Vite parish service and scheduling management system.

## Main features

- Landing page and Firebase Authentication
- User and Admin roles through Firestore
- Baptism, Wedding, and Funeral Service applications
- Application view, edit, delete, approval, rejection, and scheduling
- Simplified sidebar navigation
- Calendar and schedules
- Attachment previews
- Offline-first local storage
- Firestore offline persistence and synchronization when the connection returns
- Installable PWA shell

## Admin setup

1. Create/sign in to the administrator account using Firebase Authentication.
2. Open Firebase Console → Firestore Database.
3. Create a collection named `users`.
4. Use the administrator's Firebase Authentication UID as the document ID.
5. Add the field:
   - `role` = `Admin`
6. The next login/reload will detect the Admin role automatically.

Regular accounts should use `role = User`. The application does not show a separate Admin button on the login page.

## Running locally

```bash
npm install
npm run dev
```

Do not run individual `.jsx` files with Node.js. Run the Vite project with `npm run dev`.

## Offline behavior

The first successful visit caches the app shell for offline opening. Application data is also kept locally, while Firestore persistence queues supported changes and synchronizes them when the connection returns.

For the PWA cache to work reliably, use the built/served application (`npm run build` then `npm run preview`) when testing installation/offline behavior.
