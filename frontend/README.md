# Frontend React Application

A modern React application built with Vite, featuring user authentication, responsive design, and a complete user interface.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Landing page
│   │   ├── LoginPage.jsx   # User login
│   │   ├── RegisterPage.jsx # User registration
│   │   ├── Dashboard.jsx   # User dashboard
│   │   ├── AboutPage.jsx   # About us
│   │   ├── ContactPage.jsx # Contact form
│   │   ├── HelpPage.jsx    # Help & FAQ
│   │   └── index.js        # Page exports
│   ├── components/         # Reusable components
│   │   └── Header.jsx      # Navigation header
│   ├── services/          # API services
│   │   └── api.js         # Axios API client
│   ├── App.jsx            # Main application
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
└── README.md
```

## 🎨 Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **ESLint** - Code linting

## 🧩 Components

### Pages
- **HomePage** - Landing page with features and CTA
- **LoginPage** - User authentication form
- **RegisterPage** - User registration form
- **Dashboard** - Protected user area
- **AboutPage** - Company information
- **ContactPage** - Contact form with validation
- **HelpPage** - FAQ and support information

### Components
- **Header** - Navigation with logo, menu, and user actions

## 🔐 Authentication Flow

### Login Process
1. User enters email and password
2. Form validation checks input
3. API call to backend login endpoint
4. JWT token stored in localStorage
5. User data stored in localStorage
6. Redirect to dashboard

### Registration Process
1. User fills registration form
2. Form validation (name, email, password, confirm password)
3. API call to backend register endpoint
4. Auto-login after successful registration
5. Redirect to dashboard

### Logout Process
1. API call to backend logout endpoint
2. Clear localStorage (token and user data)
3. Redirect to homepage

## 🎯 Features

### User Interface
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Modern UI** - Clean, professional design
- ✅ **Interactive Forms** - Real-time validation
- ✅ **Navigation** - Header with logo and menu
- ✅ **User Feedback** - Loading states and error messages
- ✅ **Accessibility** - Semantic HTML and ARIA labels

### State Management
- ✅ **Local State** - React hooks (useState, useEffect)
- ✅ **Form State** - Controlled components
- ✅ **Authentication State** - User login/logout
- ✅ **Navigation State** - Page routing

### API Integration
- ✅ **Axios Client** - HTTP requests with interceptors
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Token Management** - Automatic token attachment
- ✅ **Request/Response Interceptors** - Global error handling

## 🛠️ Development Guide

### Adding New Pages

1. **Create page component:**
```jsx
// src/pages/NewPage.jsx
import React from 'react';
import Header from '../components/Header';

const NewPage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-900">
          New Page
        </h1>
      </div>
    </div>
  );
};

export default NewPage;
```

2. **Export from pages index:**
```jsx
// src/pages/index.js
export { default as NewPage } from './NewPage';
```

3. **Add to App.jsx routing:**
```jsx
// src/App.jsx
import { NewPage } from './pages';

// Add to renderPage function
case 'newpage':
  return <NewPage user={user} onLogout={handleLogout} />;

// Add to navigation handling
else if (href === '/newpage') {
  setCurrentPage('newpage');
}
```

### Adding New Components

1. **Create component:**
```jsx
// src/components/NewComponent.jsx
import React from 'react';

const NewComponent = ({ prop1, prop2 }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold">{prop1}</h2>
      <p className="text-gray-600">{prop2}</p>
    </div>
  );
};

export default NewComponent;
```

2. **Use in pages:**
```jsx
import NewComponent from '../components/NewComponent';

// Use in your page
<NewComponent prop1="Title" prop2="Description" />
```

### Styling with Tailwind CSS

#### Utility Classes
```jsx
// Layout
<div className="flex items-center justify-center min-h-screen">
  <div className="max-w-md w-full space-y-8">
    <h1 className="text-3xl font-bold text-center">Title</h1>
  </div>
</div>

// Colors
<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Button
</button>

// Responsive Design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="bg-white p-4 rounded-lg shadow">Card 1</div>
  <div className="bg-white p-4 rounded-lg shadow">Card 2</div>
</div>
```

#### Component Variants
```jsx
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const baseClasses = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

## 🔌 API Integration

### Using the API Service
```jsx
import { authAPI } from '../services/api';

// Login
const handleLogin = async (email, password) => {
  try {
    const data = await authAPI.login(email, password);
    // Handle success
  } catch (error) {
    // Handle error
  }
};

// Register
const handleRegister = async (userData) => {
  try {
    const data = await authAPI.register(userData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Custom API Calls
```jsx
import api from '../services/api';

// GET request
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// POST request
const createData = async (data) => {
  try {
    const response = await api.post('/endpoint', data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 📱 Responsive Design

### Breakpoints
- **sm:** 640px and up
- **md:** 768px and up
- **lg:** 1024px and up
- **xl:** 1280px and up

### Mobile-First Approach
```jsx
// Mobile-first responsive design
<div className="
  grid grid-cols-1           // Mobile: 1 column
  md:grid-cols-2             // Tablet: 2 columns
  lg:grid-cols-3             // Desktop: 3 columns
  gap-4
">
  <div className="bg-white p-4 rounded-lg shadow">Card</div>
</div>
```

## 🧪 Testing

### Manual Testing
1. **Start development server:** `npm run dev`
2. **Test navigation:** Click through all pages
3. **Test forms:** Fill out login/register forms
4. **Test authentication:** Login and access dashboard
5. **Test responsive design:** Resize browser window

### Component Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom
```

```jsx
// src/components/__tests__/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=My App
```

Use in code:
```jsx
const API_URL = import.meta.env.VITE_API_URL;
```

### Deployment Options
- **Vercel:** Connect GitHub repository
- **Netlify:** Drag and drop dist folder
- **GitHub Pages:** Use GitHub Actions
- **AWS S3:** Upload dist folder to S3 bucket

## 🛠️ Development Tips

### Code Organization
- **Pages:** One page per file in `src/pages/`
- **Components:** Reusable components in `src/components/`
- **Services:** API calls in `src/services/`
- **Styles:** Use Tailwind classes, avoid custom CSS

### Performance Optimization
```jsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependency]);
```

### Best Practices
- **Component Structure:** Keep components small and focused
- **Props:** Use TypeScript for prop validation
- **State:** Use local state for component-specific data
- **Effects:** Clean up side effects in useEffect
- **Accessibility:** Use semantic HTML and ARIA labels

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Axios Documentation](https://axios-http.com/)

## 🤝 Contributing

1. Follow the established component structure
2. Use Tailwind classes consistently
3. Handle loading and error states
4. Test components thoroughly
5. Follow accessibility guidelines

---

**Happy Coding! 🚀**