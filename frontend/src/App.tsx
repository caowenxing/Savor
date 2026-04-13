import React, { useState, useEffect } from 'react';
import { AddTab } from './components/AddTab';
import { ContentGrid } from './components/ContentGrid';
import { RecommendationTab } from './components/RecommendationTab';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LanguageProvider } from './contexts/LanguageContext';
import './styles/App.css';

type TabType = 'explore' | 'add' | 'recommendations';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [userId, setUserId] = useState<string>('550e8400-e29b-41d4-a716-446655440000');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 欢迎页 + 登录页状态
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
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
    <LanguageProvider>

      {/* 欢迎页 */}
      {showWelcome && (
        <div className="welcome-screen">
          <div className="welcome-card">
            <img 
              src="https://i.imgur.com/EMecS7s.jpeg" 
              alt="Savor Logo"
              className="welcome-logo" 
            />
            <h1>Savor</h1>
            <p className="welcome-desc">让收藏成为持续的价值</p>
            <button
              className="get-started-btn"
              onClick={() => {
                setShowWelcome(false);
                setShowLogin(true);
              }}
            >
              GET STARTED
            </button>
          </div>
        </div>
      )}

      {/* 登录页 */}
      {showLogin && (
        <div className="login-screen">
          <div className="login-card">
            <h2>登录 / 注册</h2>
            <input
              type="text"
              placeholder="手机号 或 邮箱"
              className="login-input"
            />
            <button
              className="login-submit"
              onClick={() => {
                setShowLogin(false);
              }}
            >
              进入我的收藏
            </button>
          </div>
        </div>
      )}

      {/* 主应用 */}
      {!showWelcome && !showLogin && (
        <div className="app-container">
          <header className="app-header">
            <div className="header-content">
              <div className="logo">
                <img 
                  src="https://i.imgur.com/EMecS7s.jpeg" 
                  alt="Savor Logo"
                  className="header-logo" 
                />
                <div className="logo-text">
                  <h1>Savor</h1>
                  <p className="tagline">让收藏成为持续的价值</p>
                </div>
              </div>
              <div className="user-info">
                <LanguageSwitcher />
                <span>User: {userId.slice(0, 8)}...</span>
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
      )}

    </LanguageProvider>
  );
}

export default App;