# React Project Structure for 12-Hour Coding Challenge

## Simple Folder Structure

```
src/
├── components/        # Reusable UI components
│   ├── Header.tsx
│   ├── DataDisplay.tsx
│   └── index.ts      # Central export file (optional)
│
├── hooks/            # Custom React hooks
│   └── useFetch.ts   # Reusable data fetching hook
│
├── services/         # API and external service calls
│   └── api.ts        # Keeps your fetch logic organized
│
├── types/            # TypeScript type definitions
│   └── index.ts      # Shared types/interfaces
│
├── assets/           # Static assets (images, svgs)
├── App.tsx           # Main app component
├── App.css           # App styles
└── main.tsx          # App entry point
```

## Quick Start Guide

### Adding a New Component

1. Create `ComponentName.tsx` in `src/components/`
2. Import directly: `import ComponentName from './components/ComponentName'`

### Adding a New API Endpoint

1. Add method to `apiService` in `src/services/api.ts`
2. Use with `useFetch` hook or call directly

### Using the Custom useFetch Hook

```tsx
import { useFetch } from "./hooks/useFetch";
import { apiService } from "./services/api";

const { data, loading, error, refetch } = useFetch(() =>
  apiService.fetchData()
);
```

## Tips for the Challenge

- Keep components simple and focused
- Use the `useFetch` hook for API calls (already handles loading/error states)
- All your existing fetch logic is preserved in `services/api.ts`
- Add new API methods to `apiService` as needed
