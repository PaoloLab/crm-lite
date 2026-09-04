This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Struttura dati

Role
- roleId (PK)
- description
- level

User
- userId (PK)
- username
- passwordHash          // mai "password" in chiaro nel nome/colonna
- name
- surname
- birthDate
- roleId (FK -> Role)

Company
- companyId (PK)
- name
- address
- piva

Contact
- contactId (PK)
- name
- surname
- companyId (FK -> Company, NULLABLE)

DealState
- dealStateId (PK)
- code           // es. 1,2,3... ordine progressivo
- slug           // es. "new", "contacted", "proposal", "won", "lost"
- label          // es. "Nuovo Lead" (testo mostrato in UI)

Deal
- dealId (PK)
- title                     // nome/titolo della trattativa
- value                     // valore economico
- dealStateId (FK -> DealState)
- dateCreation
- dateLastModified
- userId (FK -> User)       // proprietario attuale
- contactId (FK -> Contact)

ActivityType
- activityTypeId (PK)
- code           // "call", "email", "meeting", "note"...
- label

Activity
- activityId (PK)
- description
- date
- dealId (FK -> Deal)
- userId (FK -> User)          // chi ha svolto l'attività (storico, indipendente da Deal.userId)
- activityTypeId (FK -> ActivityType)