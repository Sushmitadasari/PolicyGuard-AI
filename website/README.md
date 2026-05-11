# PolicyGuard-AI 🛡️

PolicyGuard-AI is an intelligent privacy policy analysis tool powered by AI. It analyzes privacy policies from PDFs and websites, detecting risks, calculating compliance scores, and providing actionable insights through an interactive chatbot.

## 📊 Project Status

### ✅ Completed Phases

- **Phase 2**: Backend cache invalidation for history writes and deletes
- **Phase 3**: Centralized analytics synchronization across Dashboard, History, PDF Results, and Website Results
- **Phase 5**: PDF Analysis Pipeline (upload, extract, chunk, analyze)
- **Phase 6**: Website Analysis Pipeline (scrape, clean, analyze)
- **Phase 7**: History Page with live data, responsive design, and delete functionality
- **Dashboard**: Live statistics dashboard with auto-refresh on uploads, scans, and deletions

### 🔄 In Progress / Pending

- **Phase 4**: Advanced features (batch processing, custom policies, etc.)

## 🛠 Tech Stack

### Frontend

- **React 18** with Vite (fast dev server, optimized builds)
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for HTTP requests
- **Recharts** for data visualization
- **Context API** for auth state management

### Backend

- **Node.js** with Express.js
- **MongoDB** (Mongoose ODM)
- **JWT** authentication
- **Multer** for file uploads
- **Gemini/Groq/OpenAI/Claude** AI providers
- **In-memory caching** for performance optimization

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18 + Vite)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Dashboard  │  │   History    │  │ PDF Analyzer │          │
│  │  (Analytics) │  │ (View/Delete)│  │  (Upload)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Axios + JWT Auth Interceptor                     │  │
│  │    (api.js: Authorization: Bearer {token})              │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Event-Driven Architecture (dashboardEvents.js)        │    │
│  │  - triggerDashboardRefresh() on PDF upload/scan/delete │    │
│  │  - subscribeDashboardRefresh() for reactive updates    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
              │  ▲
              │  │ REST API + WebSocket (future)
              ▼  │
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Express + MongoDB)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Controllers & Route Handlers               │  │
│  │  - PDFController (upload, extract, analyze)            │  │
│  │  - WebsiteController (scrape, analyze)                 │  │
│  │  - HistoryController (dashboard stats, list, delete)   │  │
│  │  - AuthController (register, login, JWT)               │  │
│  │  - ChatbotController (multi-turn conversations)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────────────┐   │
│  │              Services Layer (Business Logic)           │   │
│  │  - aiService (prompt building, AI provider calls)      │   │
│  │  - cachingService (in-memory cache with TTL)           │   │
│  │  - historyService (CRUD operations)                    │   │
│  │  - reportService (PDF generation)                      │   │
│  │  - websiteAnalysisService (scrape + analyze)           │   │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────┐      │
│  │         MongoDB (Mongoose Models)                   │      │
│  │  - analysisModel (PDF/Website analysis records)    │      │
│  │  - userModel (authentication & profiles)           │      │
│  │  - historyModel (consolidated history view)        │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **API Keys** for AI providers (Gemini, Groq, OpenAI, etc.)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file** (in `backend/` directory):

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/policyguard

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here

   # AI Providers (choose at least one)
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key

   # Default AI Provider
   AI_PROVIDER=gemini  # or groq, openai, anthropic

   # Server Config
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the backend:**
   ```bash
   npm start
   ```
   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file** (in `frontend/` directory):

   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173` (or next available port)

## 📡 API Endpoints

### Authentication

- `POST /auth/register` — Register new user
- `POST /auth/login` — Login and receive JWT token

### PDF Analysis

- `POST /pdf/upload` — Upload and analyze PDF
  - Request: multipart/form-data with file
  - Response: `{ success, analysis: { riskScore, riskLevel, clauses[], ... } }`

### Website Analysis

- `POST /website/analyze` — Analyze website privacy policy
  - Request: `{ url: string }`
  - Response: `{ success, analysis: { ... } }`

### History & Dashboard

- `GET /history/dashboard-stats` — Get dashboard statistics
  - Response: `{ success, stats: { totalAnalyses, averageRiskScore, riskLevelBreakdown, recentItems[] } }`
- `GET /history` — Get user's analysis history (paginated, cached)
  - Response: `{ success, items: [{ id, fileName, source, analysisType, riskScore, metadata, ... }] }`
- `DELETE /history/:id` — Delete an analysis record

### Chatbot

- `POST /chatbot/message` — Send chatbot message
  - Request: `{ message: string, conversationId?: string }`
  - Response: `{ success, response: string, conversationId: string }`

### Cache Management

- `GET /cache/stats` — Get cache statistics
- `POST /cache/clear` — Clear in-memory cache

## ✨ Features

### Phase 7: History Page ✅

- **Real-time data display**: Shows actual filenames (PDFs) and domain names (websites)
- **Responsive design**: Desktop table + mobile cards (no horizontal scrollbar)
- **Delete functionality**:
  - Confirmation modal before deletion
  - Loading state during operation
  - Immediate UI update after success
- **Search & filter**: Quick search across history (frontend + backend indexed)
- **View details**: Modal to view full analysis, risks, and recommendations

### Dashboard ✅

- **Live statistics**:
  - Total analyses performed
  - Average risk score
  - Risk level distribution (pie chart)
  - Recent activity timeline (area chart)
- **Auto-refresh**:
  - Refreshes when PDF is uploaded
  - Refreshes when website is scanned
  - Refreshes when analysis is deleted
- **Professional charts**: Built with Recharts (responsive, interactive)

### Phase 5 & 6: Analysis Pipelines ✅

- **PDF Analysis**:
  - File upload with validation (size, type, extensions)
  - Text extraction from PDFs
  - Intelligent chunking
  - AI-powered risk analysis
  - Privacy policy clause detection
- **Website Analysis**:
  - Website scraping with retry logic
  - HTML cleaning and text extraction
  - Privacy policy extraction
  - Same AI analysis as PDFs

### Authentication ✅

- JWT-based authentication
- Token persistence across page reloads (localStorage)
- Protected routes with automatic redirect to login
- No auth flicker (initializing flag)

### AI Integration

- **Multiple AI providers**: Gemini, Groq, OpenAI, Claude (Anthropic)
- **Intelligent prompts**: Context-aware analysis for different scenarios
- **Fallback mechanism**: Switch providers if one fails
- **Risk scoring**: Automated risk level calculation (Low, Medium, High, Critical)

### Caching

- **In-memory cache** with configurable TTL (default 5 minutes)
- **Dashboard cache**: Separate cache for frequently accessed stats
- **Invalidation**: Automatic expiration; manual clear via API

## 🔐 Authentication Flow

```
1. User registers or logs in
   └─> Backend generates JWT (signed with secret)
   └─> Frontend stores token in localStorage

2. Frontend makes API requests
   └─> axios interceptor adds: Authorization: Bearer {token}
   └─> Backend validates token (middleware)

3. Page reload
   └─> AuthContext restores token from localStorage
   └─> User stays logged in (no re-login required)
   └─> Protected routes accessible immediately

4. Logout
   └─> Token cleared from localStorage
   └─> Redirect to login page
```

## 📊 Data Flow: PDF Upload to Dashboard

```
1. User uploads PDF
   └─> PDFAnalyzer.jsx calls handleUpload()
   └─> Sends POST /pdf/upload with file

2. Backend processes PDF
   └─> pdfController extracts text & chunks
   └─> aiService generates analysis
   └─> saveAnalysis() persists to MongoDB

3. Analysis saved
   └─> Frontend receives response
   └─> triggerDashboardRefresh() dispatches CustomEvent

4. Dashboard receives event
   └─> subscribeDashboardRefresh() callback triggers
   └─> fetchStats() re-fetches GET /history/dashboard-stats
   └─> Charts re-render with new data

5. User navigates to History
   └─> History.jsx fetches GET /history
   └─> Displays new PDF in list with real filename
```

## 🧪 Testing the Application

### Manual Testing Checklist

- [ ] Upload PDF → Dashboard auto-updates
- [ ] Scan website → Dashboard auto-updates
- [ ] Delete history item → Dashboard updates + History list refreshed
- [ ] History page shows correct filenames (PDFs) and domains (websites)
- [ ] No horizontal scrollbar on any viewport (mobile, tablet, desktop)
- [ ] Mobile cards stack properly on screens < 768px
- [ ] Logout removes token and redirects to login
- [ ] Re-login within same session works
- [ ] Page reload maintains authentication
- [ ] Protected routes redirect unauthenticated users to login

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐛 Known Issues & Limitations

### Current Issues

1. **Tailwind CSS warnings**:
   - Some style suggestions from linter (non-blocking)
   - No impact on functionality or appearance

### Limitations

- **Single-user only** (multi-user real-time updates via WebSocket/SSE remain a future enhancement)
- **In-memory cache** (persists only during server runtime; lost on restart)
- **No batch processing** (analyze one PDF/website at a time)
- **Basic chatbot** (no persistent conversation history across sessions)

## 🚀 Future Improvements

### Phase 2: Cache Optimization

- [ ] Implement cache invalidation in `saveAnalysis()` and `deleteAnalysis()`
- [ ] Clear history cache keys after DB mutations
- [ ] Add cache preloading for frequently accessed data

### Phase 3: Analytics Synchronization

- [x] Centralized AnalyticsContext for shared dashboard/history data
- [x] Single refresh flow for uploads, scans, deletes, and result pages
- [x] Synchronized Dashboard, History, PDF Results, and Website Results

### Future: Multi-user Real-time Updates

- [ ] Implement WebSocket or Server-Sent Events (SSE)
- [ ] Multi-user live dashboard updates
- [ ] Real-time history sync across browser tabs

### Phase 4: Advanced Features

- [ ] Batch PDF/website analysis
- [ ] Custom privacy policy rules
- [ ] Risk trend analysis (historical charts)
- [ ] Export reports (PDF, CSV)
- [ ] Chatbot with persistent conversation history
- [ ] Role-based access control (admin, analyst, viewer)

### Phase 5: Performance & Scale

- [ ] Database indexing for faster queries
- [ ] Pagination for large history lists
- [ ] CDN for static assets
- [ ] Database connection pooling
- [ ] Load balancing for horizontal scaling

## 📁 Project Structure

```
PolicyGuard-AI/
├── backend/
│   ├── src/
│   │   ├── ai/                    # AI provider integrations
│   │   ├── cache/                 # Caching layer
│   │   ├── chatbot/               # Chatbot logic
│   │   ├── config/                # DB & app config
│   │   ├── controllers/           # Route handlers
│   │   ├── middleware/            # Auth, logging, error handling
│   │   ├── models/                # Mongoose schemas
│   │   ├── pdf/                   # PDF extraction & chunking
│   │   ├── prompts/               # AI prompt templates
│   │   ├── routes/                # Express routes
│   │   ├── scraper/               # Website scraping
│   │   ├── services/              # Business logic layer
│   │   └── utils/                 # Helper utilities
│   ├── test/                      # Unit & integration tests
│   ├── app.js                     # Express app setup
│   ├── server.js                  # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Reusable components (Modal, etc.)
│   │   │   └── dashboard/         # Dashboard components
│   │   ├── context/               # React Context (Auth)
│   │   ├── pages/                 # Page components (Dashboard, History, etc.)
│   │   ├── services/              # API integration (api.js, historyService.js)
│   │   ├── utils/                 # Helpers (dashboardEvents.js, etc.)
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # React 18 entry point
│   │   └── index.css              # Global styles
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── README.md                      # This file
└── test-api.js                    # API testing script
```

## 🔧 Configuration

### Backend Configuration (`backend/src/config/`)

- **aiConfig.js**: AI provider selection and model parameters
- **db.js**: MongoDB connection settings

### Environment Variables

**Backend (`backend/.env`):**

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `AI_PROVIDER`: Default AI provider (gemini, groq, openai, anthropic)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development, production)

**Frontend (`frontend/.env`):**

- `VITE_API_URL`: Backend API base URL (default: http://localhost:5000)

## 📝 API Response Examples

### Dashboard Stats

```json
{
  "success": true,
  "stats": {
    "totalAnalyses": 42,
    "averageRiskScore": 68.5,
    "riskLevelBreakdown": {
      "low": 10,
      "medium": 18,
      "high": 12,
      "critical": 2
    },
    "recentItems": [
      {
        "id": "60d5ec49c1234567890abcde",
        "fileName": "privacy_policy.pdf",
        "source": "pdf",
        "riskScore": 72,
        "riskLevel": "high",
        "analyzedAt": "2026-05-10T14:30:00Z"
      }
    ]
  }
}
```

### History Item

```json
{
  "id": "60d5ec49c1234567890abcde",
  "fileName": "privacy_policy.pdf",
  "source": "pdf",
  "analysisType": "policy",
  "riskScore": 72,
  "riskLevel": "high",
  "confidence": 0.92,
  "metadata": {
    "pageCount": 5,
    "chunkCount": 12,
    "url": "https://example.com/privacy",
    "title": "Privacy Policy"
  },
  "summary": "...",
  "clauses": [
    {
      "type": "data_collection",
      "risk": "high",
      "description": "..."
    }
  ],
  "analyzedAt": "2026-05-10T14:30:00Z"
}
```

## 💡 Tips & Best Practices

### For Users

1. **Optimize policy analysis**: Ensure PDFs are clear and text-readable (images/scans may have lower accuracy)
2. **Monitor risk scores**: Focus on "Critical" and "High" risk items for immediate action
3. **Export regularly**: Download reports for compliance documentation

### For Developers

1. **Add new AI providers**: Extend `backend/src/ai/` with new provider class following existing pattern
2. **Customize prompts**: Update prompt templates in `backend/src/prompts/` for different analysis types
3. **Cache debugging**: Check `GET /cache/stats` endpoint to monitor cache performance
4. **Error handling**: All endpoints include try-catch; check logs for detailed error messages

## 📧 Support & Contact

For issues, feature requests, or questions:

1. Check the GitHub Issues page
2. Review logs in `backend/` for error details
3. Ensure all environment variables are correctly configured
4. Verify MongoDB connection and AI API keys are valid

## 📄 License

[Add your license information here]

---

**Last Updated**: May 10, 2026  
**Status**: Phase 7 + Dashboard Live Refresh ✅
