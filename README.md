# DIOganize — Parish Service System

React + Firebase/Firestore church scheduling system based on the provided DIOganize reference design.

## Run
1. Open this folder in VS Code.
2. Run `npm install`.
3. Put your Firebase Web App config in `src/firebase.js`.
4. In Firebase Console enable **Authentication → Google** and **Email/Password**.
5. Create Firestore Database.
6. Add `localhost` to Authentication → Settings → Authorized domains when needed.
7. Run `npm run dev`.

## Scheduling
The Schedule a Service form creates a Pending application. When Firebase is configured and the user is signed in, the application is written to the `serviceApplications` Firestore collection and loaded back in real time. If Firebase is not configured yet, the system keeps schedules in browser local storage so the UI remains usable while setup is completed.

Supported services: Baptism, Wedding, Funeral Service, Confirmation, First Communion, Blessing, and Marriage Preparation.

## Firestore rules
`firestore.rules` enforces the actual app permissions: authenticated users can create and read their own service applications and cancel only their own Pending requests. Only users whose Firebase UID exists as a document in `admins/{uid}` can read all requests or approve, reject, update, and delete applications. Deploy it with Firebase CLI after running `firebase init firestore`.

## Important
Do not put Firebase service-account private keys in the React project or GitHub.

## Design
Navy + gold theme lives in `src/theme.css` (loaded after `App.css`). Built-in illustrations are in `public/images/*.svg`; drop a same-named `.jpg` there to use a real photo instead (see `public/images/README.txt`).

Pages: Dashboard, Schedule (4-step form), Calendar (month view + service view cards), Church Services, Applications, Events, Announcements, Facilities. Members, Ministries and Documents are placeholders.

## Admin role
Requests submitted by users go to the admin, who approves or rejects them (Applications page).

- **Users** see only their own requests and can only cancel a request that is still Pending.
- **Admins** see every request, with the requester's email, and can Approve / Reject / Delete.

An admin is a Firebase user who has a document in the `admins` collection whose **document ID is their UID**.

To make someone an admin:
1. Have them sign in once (email/password or Google).
2. Firebase Console → Authentication → Users → copy their **User UID**.
3. Firestore Database → Start collection `admins` → Document ID = that UID → add any field (e.g. `role` = `admin`) → Save.
4. Publish `firestore.rules` (Firestore → Rules tab, or `firebase deploy --only firestore:rules`).
5. The person signs out and back in. The top bar will show "Admin".

Admins cannot be created from inside the app on purpose, so a normal user can never promote themselves.
