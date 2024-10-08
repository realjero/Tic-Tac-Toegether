import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root.tsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';
import Home from './pages/Home.tsx';
import Game from './pages/Game.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Admin from './pages/Admin.tsx';
import Profile from './pages/Profile.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <Home />
            },
            {
                path: '/:username',
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                )
            },
            {
                path: '/play',
                element: <Game />
            },
            {
                path: '/admin',
                element: (
                    <ProtectedRoute adminOnly={true}>
                        <Admin />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
