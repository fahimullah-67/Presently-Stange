# Setup Instructions - Presently React App

## Installation (5 minutes)

### Step 1: Install Dependencies
```bash
cd presently-app
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
```
http://localhost:5173
```

## What You Get

✅ **9 Complete Pages**
- Welcome page
- Authentication (Login/Signup)
- Dashboard (with attendees/chat toggle & CSV export)
- Polls management
- Chat system
- Analytics with charts
- Settings panel
- Session history
- Billing/Plans

✅ **Full Functionality**
- Toggle between attendees and chat
- Send messages and persist to localStorage
- Export session data as CSV
- Create and manage polls
- View analytics with charts
- Responsive mobile design
- Dark mode ready

✅ **Production Ready**
- Clean code structure
- Reusable components
- Easy to customize
- Ready for API integration

## Project Layout

All source code is in `src/`:
- **pages/** - All 9 page components
- **components/** - Reusable components (Sidebar)
- **App.jsx** - Route configuration
- **main.jsx** - Entry point
- **index.css** - Global styles

## Testing the App

After running `npm run dev`, test these:

1. **Welcome** → `/`
2. **Login** → `/auth`
3. **Dashboard** → `/dashboard`
   - Click "Attendees" button - see list
   - Click "Chat" button - see messages
   - Send a message - persists in localStorage
   - Click "Export CSV" - downloads file
4. **Polls** → `/dashboard/polls`
   - Create a new poll
   - See it in the list
5. **Chat** → `/dashboard/chat`
   - View all messages
   - Search messages
6. **Analytics** → `/dashboard/analytics`
   - See charts with data
   - Export as CSV
7. **Settings** → `/dashboard/settings`
   - Change profile info
8. **History** → `/dashboard/history`
   - View past sessions
9. **Billing** → `/dashboard/billing`
   - See pricing plans

## Connect to Your Backend

### Step 1: Create API Service
Already done! See commented code in components for API calls.

### Step 2: Update API URL
Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Replace localStorage
Change from:
```javascript
const polls = getPolls();
```

To:
```javascript
const [polls, setPolls] = useState([]);
useEffect(() => {
  fetch(`${process.env.REACT_APP_API_URL}/polls`)
    .then(r => r.json())
    .then(data => setPolls(data));
}, []);
```

## Build Commands

```bash
# Development with HMR
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code (if eslint added)
npm run lint
```

## File Structure Quick Reference

```
src/
├── pages/
│   ├── Welcome.jsx      # Landing
│   ├── Auth.jsx         # Login/Signup
│   ├── Dashboard.jsx    # Main page
│   ├── Polls.jsx        # Polls
│   ├── Chat.jsx         # Chat
│   ├── Analytics.jsx    # Charts
│   ├── Settings.jsx     # Settings
│   ├── History.jsx      # History
│   └── Billing.jsx      # Billing
├── components/
│   └── Sidebar.jsx      # Navigation
├── App.jsx              # Routes
├── main.jsx             # Entry
└── index.css            # Styles
```

## Dependencies

- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Routing
- `lucide-react` - Icons
- `recharts` - Charts
- `axios` - HTTP client
- `tailwindcss` - Styling

## Key Features to Explore

### Dashboard
- Attendees list with online status indicator
- Chat toggle button
- Send messages - auto-saves to localStorage
- CSV export downloads session data
- Quick poll templates
- Live poll results display

### Polls
- Create new polls with questions
- Manage existing polls
- Delete polls
- Poll templates (Yes/No, Pulse, This or That, Custom)

### Chat
- Send and receive messages
- Search messages by sender or content
- Real-time message display
- Timestamp for each message

### Analytics
- Bar chart showing response trends
- Line chart showing engagement
- KPI cards (responses, engagement rate, attendees)
- CSV export functionality
- Period filter (week, month, quarter)

### Responsive Design
- Mobile: Single column, hamburger menu
- Tablet: 2-column layout
- Desktop: Full 3-4 column layout

## Customization

### Add a New Page
1. Create file in `src/pages/NewPage.jsx`
2. Add route in `App.jsx`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```
3. Add nav link in `Sidebar.jsx`

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#YOUR_COLOR',
    }
  }
}
```

### Modify Styles
All styling uses Tailwind classes in JSX. Edit directly in components.

## Common Issues

**Port 5173 in use?**
```bash
npm run dev -- --port 5174
```

**Modules not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Styles not showing?**
```bash
npm install
```

## Next Steps

1. ✅ Explore all 9 pages
2. ✅ Test chat and polling
3. ✅ Try CSV export
4. ⏭️ Build backend API
5. ⏭️ Connect to API
6. ⏭️ Add video SDK
7. ⏭️ Deploy to production

