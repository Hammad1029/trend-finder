# Trend Finder Agent

AI-powered e-commerce trend analysis agent that:

1. **Extracts** search keywords from natural language requests
2. **Scrapes** product data from Amazon
3. **Clusters** similar products using DBSCAN
4. **Analyzes** trends using DataForSEO
5. **Scores** market opportunities

## Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install in development mode
pip install -e ".[dev]"
```

## Configuration

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/trend_finder
OPENAI_API_KEY=sk-...
APIFY_TOKEN=apify_api_...
DATAFORSEO_USERNAME=...
DATAFORSEO_PASSWORD=...
ENV=development
```

## Usage

```bash
# Run the agent
python -m trend_finder

# Or use the CLI
trend-finder
```

## Project Structure

```
src/trend_finder/
├── schemas/          # Pure data models (no logic)
├── config/           # Settings and constants
├── database/         # SQLAlchemy models and connection
├── llm/              # LLM utilities
├── services/         # Business logic
│   ├── scoring/      # Product and trend scoring
│   ├── clustering/   # Analytics and keyword extraction
│   └── external/     # Third-party API integrations
├── nodes/            # LangGraph nodes
└── core/             # Graph state and builder
```

## Architecture

The project follows a **layered architecture** to prevent circular imports:

```
config  ← (no deps)
   ↓
schemas ← (only config)
   ↓
database ← (schemas + config)
   ↓
services ← (schemas + database + config)
   ↓
nodes   ← (services + schemas)
   ↓
core    ← (nodes + everything above)
```

## Development

```bash
# Run tests
pytest

# Type checking
mypy src/

# Linting
ruff check src/

# Formatting
black src/
```
