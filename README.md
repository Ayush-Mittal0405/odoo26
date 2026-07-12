# 🌍 EcoSphere — Enterprise ESG Management Platform

Welcome to **EcoSphere** (developed under the *Pavitrarpan Foundation* workspace), a state-of-the-art Enterprise ESG (Environmental, Social, and Governance) Management Platform. Designed for modern corporations and NGOs, EcoSphere empowers organizations to track their carbon footprint, manage social impact initiatives, streamline governance policies, and drive employee engagement through gamification.

---

## 🚀 Key Modules & Features

### 1. 📊 Centralized ESG Dashboard
* **Real-time Overview**: Interactive dashboard offering insights into aggregate environmental, social, and governance compliance rates.
* **Key Metrics**: Live widgets showing total carbon footprint ($tCO_2e$), active goals, compliance issues, and CSR involvement.
* **ESG Scorecard**: Visual scorecards with customized weight configurations (e.g., E: 40%, S: 30%, G: 30%).

### 2. 🌱 Environmental Impact Tracker (E)
* **Emission Factors**: Register emission calculation coefficients for electricity, travel, logistics, and more.
* **Product ESG Profiles**: Establish and track environmental footprints (carbon, water, recycled content) for individual SKUs and products.
* **Carbon Transaction Ledger**: Log emission transactions per department, classified by category and source (automatic calculations vs. manual log).
* **Environmental Goals**: Set department-specific reduction targets, monitor deadlines, and track real-time goal fulfillment statuses.

### 3. 🤝 Social Responsibility & Engagement (S)
* **CSR Initiative Center**: Launch, categorize, and track corporate social responsibility events and volunteer activities.
* **Participation Workflow**: Validate employee participation through a robust evidence submission and admin approval mechanism.
* **Diversity Analytics**: Monitor organization-wide diversity stats and demographics.

### 4. ⚖️ Governance & Compliance (G)
* **Policy Management**: Centralized repository of organizational policies with version control, draft states, and categorizations.
* **Acknowledgements System**: Track sign-offs and policy agreements among employees.
* **Audit Registry**: Schedule and review details of upcoming, ongoing, and past audits along with findings.
* **Compliance Registry**: Flag and resolve compliance issues, assigning due dates, owners, and severity levels.

### 5. 🏆 Gamification & Rewards
* **Eco-Challenges**: Drive friendly competition through themed challenges with XP and points incentives.
* **Points Redemptions**: Redeem earned points for physical or digital items in the Reward Store.
* **Leaderboard & Badges**: Rank employees by ESG contributions and automatically award milestone badges.

### 6. 📈 Executive Reporting
* **Interactive Charts**: Responsive data visualization built with Recharts.
* **Report Builder**: Export customized CSV datasets or compile professional executive PDF digests using `jspdf`.

---

## 🛠️ Technology Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Client Components)
* **Runtime / Language**: [TypeScript](https://www.typescriptlang.org/) & [Node.js](https://nodejs.org/)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
* **UI & Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (for animations), and [Lucide Icons](https://lucide.dev/)
* **Charts**: [Recharts](https://recharts.org/)
* **PDF Export**: [jsPDF](https://github.com/parallax/jsPDF)

---

## 📂 Project Directory Structure

```text
pavitrarpan-foundation/
├── .env                  # Local environment variables
├── .env.example          # Template for environment configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Dependency and script management
├── tsconfig.json         # TypeScript configuration
├── prisma/               # Database management
│   ├── schema.prisma     # Prisma database schemas & models
│   └── seed.ts           # Mock data populator/database seeding script
├── public/               # Static assets & SVG icons
└── src/                  # Main application source code
    ├── app/              # Next.js App Router root
    │   ├── api/          # RESTful backend API routes
    │   │   ├── audits/                  # Audit endpoints
    │   │   ├── carbon-transactions/     # Carbon transaction ledger endpoints
    │   │   ├── challenges/              # Gamified challenge endpoints
    │   │   ├── compliance-issues/       # Governance compliance endpoints
    │   │   ├── csr-activities/          # Corporate social responsibility endpoints
    │   │   ├── emission-factors/        # Carbon footprint coefficient endpoints
    │   │   ├── employee-participation/  # CSR participation log endpoints
    │   │   ├── employees/               # Employee leaderboard/profile endpoints
    │   │   ├── environmental-goals/     # Sustainability target tracking endpoints
    │   │   ├── notifications/           # System and module alert notifications
    │   │   ├── policies/                # Governance policies endpoints
    │   │   ├── policy-acknowledgements/ # Policy sign-off tracking endpoints
    │   │   ├── product-profiles/        # Product footprint catalog endpoints
    │   │   ├── rewards/                 # Redeemable items catalog endpoints
    │   │   └── settings/                # ESG weights and system settings
    │   ├── favicon.ico
    │   ├── globals.css   # Main stylesheet & Tailwind imports
    │   ├── layout.tsx    # Root layout configuration
    │   ├── page.tsx      # Application entry workspace
    │   ├── robots.ts     # SEO robots config
    │   └── sitemap.ts    # SEO sitemap builder
    ├── components/       # Reusable React components
    │   ├── Header.tsx    # Top navbar, notification drawer & profile bar
    │   ├── Sidebar.tsx   # Dashboard navigation (Modules and submenus)
    │   ├── UIComponents.tsx # Custom UI components (modals, tables, custom tabs, toast alerts)
    │   ├── screens/      # Core page/module content screens
    │   │   ├── DashboardScreen.tsx      # ESG Overview & Key Statistics
    │   │   ├── EnvironmentalScreen.tsx  # Track carbon, goals, products, and factors
    │   │   ├── GamificationScreen.tsx   # Rewards shop, challenges, and user leaderboards
    │   │   ├── GovernanceScreen.tsx     # Policies, compliance register, and audits
    │   │   ├── ReportsScreen.tsx        # PDF exports and report generators
    │   │   ├── SettingsScreen.tsx       # Set ESG targets, categories, and module weights
    │   │   └── SocialScreen.tsx         # CSR volunteer logs and employee submissions
    │   └── ui/           # Underlying design system primitives
    │       ├── button.tsx
    │       ├── demo.tsx
    │       └── floating-bubbles-background.tsx  # Interactive visual effect
    ├── context/          # Application-wide React Context providers
    │   └── EcoSphereContext.tsx  # Context for global state, Toast bridge & API fetch orchestrator
    └── lib/              # Helper libraries and utilities
        ├── prisma.ts     # Singleton Prisma Client instance
        └── utils.ts      # CSS Tailwind-merge and utility functions
```

---

## ⚡ Setup & Installation

Follow these steps to run EcoSphere locally on your machine:

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* **PostgreSQL** database instance running locally or hosted online (e.g., Supabase, Neon)

### 2. Clone and Install Dependencies
Navigate to the project folder and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (you can copy `.env.example` as a template):
```bash
cp .env.example .env
```
Inside your `.env` file, configure your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

### 4. Setup the Database Schema
Push the schema to your PostgreSQL database using Prisma:
```bash
npm run db:push
```

### 5. Seed Database Mock Data
Populate the database with predefined carbon transactions, challenges, employees, policies, emission factors, and rewards to experience a live environment:
```bash
npm run db:seed
```

### 6. Launch the Local Development Server
Start the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 7. View Database with Prisma Studio (Optional)
If you want to view, edit, or delete database table rows in an interactive UI:
```bash
npm run db:studio
```

---

## 📄 License
This project is proprietary and intended for internal use under the **Pavitrarpan Foundation** initiative. All rights reserved.
