import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Channel from './components/channel/Channel';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased dark:bg-gray-900 dark:text-white">
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <Channel />
          </MainLayout>
        } />
      </Routes>
    </div>
  );
} 