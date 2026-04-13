import React, { useState, useEffect } from 'react';
import { AddTab } from './components/AddTab';
import { ContentGrid } from './components/ContentGrid';
import { RecommendationTab } from './components/RecommendationTab';
import { SavorLogo } from './components/SavorLogo';
import './styles/App.css';

type TabType = 'explore' | 'add' | 'recommendations';

/**
 * 主应用程序 - Savor App
 */
function App() {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [userId, setUserId] = useState<string>('550e8400-e29b-41d4-a716-446655440000');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // 从localStorage读取userId，如果没有则使用默认值
    const stored = localStorage.getItem('savor_user_id');
    if (stored) {
      setUserId(stored);
    } else {
      localStorage.setItem('savor_user_id', userId);
    }
  }, []);

  const handleContentImported = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('explore');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <SavorLogo size={40} className="logo-svg" />
            <div className="logo-text">
              <h1>Savor</h1>
              <p className="tagline">让收藏成为持续的价值</p>
            </div>
          </div>
          <div className="user-info">
            User: {userId.slice(0, 8)}...
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          📚 我的收藏
        </button>
        <button
          className={`nav-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          ✨ 为你推荐
        </button>
        <button
          className={`nav-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ 添加收藏
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'explore' && (
          <div className="tab-content">
            <ContentGrid
              userId={userId}
              refreshTrigger={refreshTrigger}
              filter="unviewed"
            />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="tab-content">
            <RecommendationTab userId={userId} />
          </div>
        )}

        {activeTab === 'add' && (
          <div className="tab-content">
            <AddTab userId={userId} onContentImported={handleContentImported} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Savor v1.0 MVP - 让内容重获新生</p>
      </footer>
    </div>
  );
}

export default App;
