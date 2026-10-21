import { useState } from 'react';

function Topbar({ onMenu, onNavigate, account }) {
  const [search, setSearch] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (search.trim()) {
      onNavigate('Applications');
    }
  };

  const displayName = account?.name || (account?.type === 'Admin' ? 'Admin' : 'User');
  const displayType = account?.type === 'Admin' ? 'Administrator' : 'Parish User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu}>☰</button>
      <form className="search-box" onSubmit={submit}>
        <span>⌕</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search applications, schedules..."
        />
      </form>
      <div className="topbar-right">
        <button className="notification-button">●</button>
        <div className="admin-profile">
          <div className="avatar">{initial}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{displayType}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
