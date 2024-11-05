## fullstack-demo-projects

[[Deployed Website]]()

Fullstack projects following multiple tutorials online.
- The monorepo is managed by pnpm workspace
- All projects are written in **Typescript**.
- Backend code are deployed as **Vercel** Serverless Functions.
- Connects to **Supabase PostgreSQL** or **MongoDB** database, and Supabase object storage.

<p align="center">
    <img alt="pnpm" src="https://img.shields.io/badge/pnpm-yellow?style=for-the-badge&logo=pnpm&logoColor=white" />
    <img alt="typescript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="vercel" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
    <img alt="supabase" src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=MediumSeaGreen" />
    <img alt="mongodb" src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

### Estate Market

[Visit >>>](https://hmpthz-estate-market.vercel.app)

[[youtube]](https://www.youtube.com/watch?v=VAaUy_Moivw) MERN Stack Project: Build a Modern Real Estate Marketplace with react MERN (jwt, redux toolkit)

### Twitter Clone

[Visit >>>](https://hmpthz-twitter-clone.vercel.app)

[[youtube]](https://www.youtube.com/watch?v=jqVm5_G1ZEE) How To Create A Social Media App Using The T3 Stack - Next.js, React, Tailwind, Prisma, TypeScript

- Built on **Next.js** pages router for optimized client and server-side rendering.
- Utilized **Prisma ORM** to streamline **PostgreSQL** database operations.
- Created type-safe APIs with **tRPC** for robust backend and frontend communication.
- Using **react-query** for efficient data fetching and state management.
- Added **Next-Auth** to support multiple authentication providers.
- Implemented **optimistic updates** to enhance user experience and responsiveness.

### Deploying on Vercel

Devs must pay attentin to several (non-critical) issues while deploying a project in monorepo to Vercel, which seem to be considered as low-priority by Vercel team.

- `.vercelignore` must be placed in the root directory of **repo** to take effect, although documentation says *"should be placed in the root directory of your project"*. Since this file is mostly the same as `.gitignore`, it is best to keep only one ignore file in the root directory of monorepo.

- Backend code must be placed in `/api` directory for Vercel to correctly deploy functions. The deployment happens **after** install command, **before** build command. So it is based on **sourcecode**, not the whatever outputs your project builds. The building procedure of functions is entirely managed by Vercel that you have no way to configure.

- Building functions needs dependencies installed by command. However, it can't correctly find dependencies in projects managed by pnpm workspaces, you can only put them in root project.

