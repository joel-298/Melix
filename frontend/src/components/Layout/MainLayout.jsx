import Sidebar from './Sidebar';
import AudioPlayer from '../Player/AudioPlayer';
import SearchBar from '../Search/SearchBar';
import { useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const location = useLocation();
  const isSearch = location.pathname === '/search';

  return (
    <div className="flex h-screen bg-[#121212] overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-8 py-4 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
          {!isSearch && (
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
          )}
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-28 px-8">
          {children}
        </div>
      </main>
      <AudioPlayer />
    </div>
  );
}
