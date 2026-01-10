# PayAware - Ethical Financial Awareness Platform

<img width="2261" height="3354" alt="image" src="https://github.com/user-attachments/assets/7b98b816-7412-42cb-8b30-8a24d62bcc4d" />



## 🔗 Live Demo
**[https://pay-aware.vercel.app/login]**

---

## 1. Problem Statement & Domain
**Domain**: Personal Finance / Fintech

Financial anxiety is increasing as users struggle to maintain awareness of their spending habits and overall financial health. Most traditional banking and finance applications prioritize dense transaction lists and complex interfaces, offering limited support for reflection, understanding, or proactive awareness. This often leads to disengagement and poor financial decision-making.

*PayAware* addresses this challenge by providing a secure, ethical, and awareness-first financial dashboard designed to help users understand their finances without executing payments or offering financial advice. The platform leverages Voice AI to simplify expense and income logging, reducing friction and encouraging consistent usage. By presenting clear, explainable summaries such as income-versus-expense trends, PayAware enables users to build financial awareness without dark patterns, automation bias, or information overload.

---

## 2. Key Features
Hands-Free Voice-Based Logging
Integrated Vapi.ai Voice Agent enables users to log income and expenses using natural speech, reducing friction and encouraging consistent financial tracking.

AI-Powered Transaction Summaries
Uses Google Gemini to generate clear, explainable summaries of spending patterns, income-versus-expense trends, and periodic financial overviews derived strictly from user-provided data.

Voice-Based Financial Insights
Supports voice-driven queries and spoken summaries, allowing users to understand their financial status without navigating complex dashboards.

Ethical, Awareness-First AI Design
AI outputs are strictly informational and non-advisory. The system does not execute payments, enforce decisions, or provide financial or investment advice.

UPI Payment Link Generation
Integrated Razorpay is used only to generate secure UPI deep links, redirecting users to external payment apps for transaction completion, with manual user confirmation.

Secure Authentication and Data Isolation
Built on Supabase Authentication with Row Level Security (RLS) to ensure users can access only their own financial data at all times.

Server-Side Rendering and Backend Enforcement
Powered by Next.js App Router with Server-Side Rendering, ensuring backend-enforced authentication, authorization, and secure API handling.

Production-Ready Containerization
Fully containerized using Docker, enabling consistent builds, environment isolation, and deployment through a single Docker Compose workflow.

Scalable and Clean Architecture
Follows a layered separation of concerns across UI, business logic, AI orchestration, external services, and security middleware for maintainability and scalability.

---

## 3. System Architecture Overview
The application follows a modern, scalable micro-services architecture:

-   **Frontend**: Next.js 15 (App Router) for server-side rendering and robust routing.
-   **Styling**: Tailwind CSS v4 with Shadcn UI and Framer Motion for premium, responsive animations.
-   **Backend / Database**: Supabase (PostgreSQL) for relational data and authentication.
-   **AI Integration**: Vapi.ai for real-time voice-to-action processing.
-   **Infrastructure**: Fully containerized with Docker.

**Data Flow**:
1.  **User Interaction**: User logs in securely via Supabase Auth.
2.  **Voice Command**: User speaks ("I spent 500 rupees on food").
3.  **Processing**: Vapi.ai converts speech to intent and calls the `/api/ai/vapi` webhook.
4.  **Validation**: The system checks the user's current balance against the requested expense.
5.  **Execution**: Valid transactions are committed to Supabase; invalid ones trigger a voice warning.

---

## 4. Setup & Deployment Instructions

### ⚠️ Security Note
This project strictly avoids hard-coded secrets. You **MUST** create a `.env` file based on the example below before running.

### Option A: Docker (Preferred Method) 🐳
*This method spins up the entire stack with a single command.*

1.  **Configure Environment**:
    Create a `.env` file in the root directory.
    
    > **⚠️ Security Warning:** Never commit your `.env` file. Use the template below.

    ```env
    # ------------------------------
    # 1. Supabase (Database & Auth)
    # ------------------------------
    NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_secret_service_role_key

    # ------------------------------
    # 2. AI Integration
    # ------------------------------
    # Used for Voice Agent (Vapi.ai)
    
    NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
    
    # Used for Insights (Gemini)

    GOOGLE_AI_API_KEY=your_gemini_api_key

    # ------------------------------
    # 3. Payments (Razorpay)
    # ------------------------------
    # Public key for frontend checkout

    NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
    
    # Secret key for verifying payments (Server-side only)

    RAZORPAY_KEY_SECRET=your_razorpay_secret
    ```

2.  **Start Application**:
    ```bash
    docker pull axbhijith/payaware:latest
    docker run axbhijith/payaware:latest
    ```
    Access the app at `http://localhost:3000`.

### Option B: Manual Setup (Local Dev) 💻
1.  Install dependencies: `npm install`
2.  Setup `.env` as described above.
3.  Run development server: `npm run dev`
4.  Access at `http://localhost:3000`.

---

## 5. Design Decisions & Trade-offs
*To align with development rules requiring justification of design choices:*

**Small-Scale, Validation-First Architecture:**
The current architecture is intentionally optimized for small-scale usage and controlled user testing. This allows us to validate core ideas such as voice-based logging, awareness-driven insights, and ethical AI interactions before investing in large-scale infrastructure. As user adoption grows, the architecture can evolve toward distributed services, dedicated caching layers, and advanced observability.

**Next.js App Router:**
Selected for its Server Actions and Server-Side Rendering capabilities, enabling secure backend logic and database operations without exposing excessive API endpoints. This simplifies development and improves security for early-stage deployment, while leaving room for future API gateway–based architectures.

**Supabase over a Custom Backend:**
We prioritized correctness, reliability, and development velocity over building a custom authentication and authorization system. Supabase’s built-in Auth and Row Level Security (RLS) are production-proven and reduce the risk of security misconfigurations during early-stage experimentation.

**Limited Horizontal Scalability by Design:**
The current system does not aggressively optimize for high concurrency or massive scale. This is a deliberate trade-off to keep the architecture understandable, debuggable, and suitable for small user cohorts. Future iterations can introduce load balancing, message queues, and distributed rate limiting as needed.

**Vapi.ai for Voice Interaction:**
Rather than building a custom speech-to-text and text-to-speech pipeline, we integrated Vapi.ai to ensure low-latency, reliable voice interactions. This allows rapid iteration on voice-based UX while enabling future expansion to multiple specialized voice agents.

**Expandable AI Architecture:**
The current AI layer focuses on summarization, awareness, and explainable insights. The architecture is intentionally designed to support multiple AI agents, richer contextual analysis, and more advanced conversational capabilities as the product matures.

**Razorpay in Test Mode:**
Razorpay is currently integrated in test mode to safely validate payment link generation and UPI redirection flows. This enables end-to-end testing without financial risk. Full production UPI features can be enabled once the application receives funding and completes required compliance steps.

**Feature-First Development Approach:**
At this stage, the primary goal is to demonstrate core features and user experience, rather than optimize for enterprise-scale production. This allows rapid feedback, clearer demos, and faster iteration before committing to long-term infrastructure decisions.

**Ethical and Non-Advisory AI Design:**
AI behavior is intentionally constrained to be informational and non-decision-making. System prompts, low-temperature settings, and explicit scope boundaries prevent hallucinations, financial advice, or automated enforcement actions.

**Regulatory Awareness, Not Compliance Automation:**
Financial and regulatory updates (such as RBI announcements) are presented as high-level awareness summaries. This avoids framing the system as a compliance engine while still keeping users informed of relevant developments.

---

## 6. Assumptions and Compliance
**Originality:**
This solution was independently conceptualized, designed, and implemented by the team specifically for Build2Break ’26. No pre-existing products, templates, or commercial codebases were reused in the development of this application.

**Currency Assumptions:**
The application defaults to Indian Rupees (INR) for all monetary inputs, calculations, and displays. This design choice aligns with the target user context and simplifies early-stage validation.

**Voice Interaction Latency:**
Voice-based interactions rely on external services and network conditions. As a result, response times may vary depending on internet connectivity and Vapi.ai service load.

**Compliance and Usage Scope:**
This application is a prototype developed strictly for educational and hackathon purposes. It is not a licensed banking, payment, or financial advisory product and should not be used for real-world financial decision-making or compliance evaluation.

---
## Live Demo and Deployment Links

The following resources are provided to support evaluation and testing of the application:

**Vercel Live Demo:** *[https://pay-aware.vercel.app/login]*

Deployed production build for quick access and feature exploration.

**Docker Image:**  *[docker pull axbhijith/payaware]*

Pre-built Docker image for local execution and environment-independent testing.

Built for Build2Break 2026
