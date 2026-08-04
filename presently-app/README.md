# Presently - React + Vite Frontend

A modern, fully responsive React application for live session management with real-time polls, chat, and analytics. Built with Vite, Tailwind CSS, and React Router.

## Features

✅ **Complete UI Implementation**
- Welcome/Landing page
- Authentication (Login/Signup)
- Dashboard with attendees/chat toggle
- Polls management
- Real-time chat system
- Analytics with charts (Recharts)
- Settings panel
- Session history
- Billing/Subscription management

✅ **Technical Features**
- Fast dev server (Vite)
- Client-side routing (React Router v6)
- Responsive design (mobile first)
- Tailwind CSS styling
- Lucide React icons
- Recharts for data visualization
- Axios ready for API integration
- localStorage for data persistence

## Project Structure

```
presently-app/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx           # Navigation sidebar
│   ├── pages/
│   │   ├── Welcome.jsx           # Landing page
│   │   ├── Auth.jsx              # Login/Signup
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Polls.jsx             # Polls management
│   │   ├── Chat.jsx              # Chat interface
│   │   ├── Analytics.jsx         # Analytics dashboard
│   │   ├── Settings.jsx          # User settings
│   │   ├── History.jsx           # Session history
│   │   └── Billing.jsx           # Billing/Plans
│   ├── App.jsx                   # Router config
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
npm run preview
```

## Available Pages

| Page | Route | Features |
|------|-------|----------|
| Welcome | `/` | Landing page with features |
| Auth | `/auth` | Login/Signup forms |
| Dashboard | `/dashboard` | Main session control |
| Polls | `/dashboard/polls` | Create and manage polls |
| Chat | `/dashboard/chat` | Real-time messaging |
| Analytics | `/dashboard/analytics` | Performance charts |
| Settings | `/dashboard/settings` | User preferences |
| History | `/dashboard/history` | Past sessions |
| Billing | `/dashboard/billing` | Plans and pricing |

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool (10x faster than Create React App)
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Key Components

### Dashboard
- Live attendees list with online status
- Chat interface with message persistence
- CSV export functionality
- Quick poll templates
- Live poll results display

### Analytics
- Response trends chart
- Engagement analytics
- KPI cards
- Data export (CSV)

### Responsive Design
- Mobile hamburger menu
- Tablet-optimized layouts
- Desktop full experience
- Touch-friendly buttons

## Data Persistence

Currently uses localStorage for demo. Ready for easy API integration:

```javascript
// Replace localStorage with API calls
// Before:
const polls = getPolls();

// After:
const [polls, setPolls] = useState([]);
useEffect(() => {
  pollsAPI.getPolls().then(res => setPolls(res.data));
}, []);
```

## Environment Variables

Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Styling

- Utility-first CSS with Tailwind
- CSS variables for theming
- Dark mode ready
- Fully customizable colors

## API Integration Ready

Pre-configured for MERN backend:

```javascript
import { pollsAPI, chatAPI, analyticsAPI } from './services/api';

// Use in components
pollsAPI.getPolls()
chatAPI.sendMessage(id, message)
analyticsAPI.getAnalytics(id)
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Dev server startup: <1 second
- HMR updates: Instant
- Build time: 2-3 seconds
- Optimized bundle size

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist folder to Vercel
```

### Netlify
```bash
npm run build
# Drag dist folder to Netlify
```

### Self-Hosted
```bash
npm run build
# Deploy dist/ folder to your server
```

## Customization

### Change Colors
Edit Tailwind config theme colors

### Add Pages
1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`
3. Add link in `Sidebar.jsx`

### Modify Styles
All styles use Tailwind classes - edit in JSX or `index.css`

## Next Steps

1. ✅ UI is complete and functional
2. ⏭️ Build your MERN backend APIs
3. ⏭️ Connect API endpoints
4. ⏭️ Add video SDK integration
5. ⏭️ Deploy to production

## Troubleshooting

**Port 5173 already in use:**
```bash
npm run dev -- --port 5174
```

**Modules not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Styles not loading:**
```bash
npm install
```

## License

MIT

## Support

For documentation:
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
