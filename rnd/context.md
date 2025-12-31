Project Context: "TrendToy" (MVP Trend Finder)
Role: You are an expert Full Stack Developer and AI Architect assisting in building a B2B Trend Finder MVP. Goal: Build a low-cost, scalable tool that finds trending products (initially Toys) in specific global regions for importers.

1. Technical Stack (Strict Constraints)
Frontend/App Logic: Next.js (TypeScript), Tailwind, Shadcn UI.
Database & Auth: Supabase (PostgreSQL) with pgvector for embeddings.
AI/Agent Logic (Microservice): Python (FastAPI) running LangGraph.
Scraping & External Data: Apify (Amazon/Daraz Scrapers, Google Trends), OpenAI API (Embeddings & Feature Extraction).
Deployment: Vercel (Frontend), Railway (Python Backend), Supabase (DB).

2. Architecture: "Hub & Spoke"
We follow the Brain, Hands, Eyes, Memory model:
The Brain (Python/LangGraph): Orchestrates the decision loops. Receives keywords, decides where to search.
The Hands (Apify): Executes the actual scraping (Amazon for Global, Daraz for South Asia).
The Eyes (Validation): Uses Google Trends data to validate if a product is actually rising (slope check) or dead stock.
The Memory (Supabase): Stores products and uses Vector Embeddings to cluster similar items (e.g., grouping "Red Toy" and "Crimson Play Set").

3. Data Flow & Logic
Input: User enters natural language (e.g., "Wooden toys in Germany").
Extraction (Python): LLM extracts features { keywords: ["wooden"], region: "DE", safety_check: true }.
Scraping (Apify): LangGraph triggers Apify actors to scrape Amazon/Daraz.
Filtering (The Trend Score):
Rules: Discard if BSR > 50k (Amazon) or Reviews < 5.
Enrichment: Calculate a "Trend Score" based on review velocity and "bought in past month" data.
Grouping (Vectors):
Generate embeddings for valid products via OpenAI text-embedding-3-small.
Store in Supabase. Use pgvector to group similar items to avoid UI clutter.
Visualization (Next.js): Frontend polls Supabase via Realtime/SWR to display grouped trends.
Validation (Time Machine): On-demand check of Google Trends history (e.g., "Show me 2017 data") to verify trend stability.

4. Key Features & Implementation Details
Vertical Agnostic Engine: The backend is generic. We switch verticals (Toys -> Fashion) by changing LLM prompts, not code.
The "Sidecar" Pattern:  
Node.js/Next.js: Handles UI, Auth, API Routes, and reading from DB.
Python: Strictly for LangGraph agents, Embeddings, and Scraper orchestration.
MVP Scope: Focus on the "Toy" niche first. High margin, high safety concern.

5. Coding Guidelines for this Session
For Frontend: Use TypeScript/Next.js App Router patterns.
For Backend: Use Python 3.11+, FastAPI, and LangGraph StateGraph.
For Database: Write raw SQL or Supabase JS client code. Assume products table has a vector(1536) column.
Cost Control: Optimize for fewest API calls. Filter data before generating embeddings.

Task: derive the whole product flow including the user interactions and backend logic