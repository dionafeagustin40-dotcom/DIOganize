import { useState } from 'react';
import Icon from './Icons';

export default function Topbar({ onMenu, onNavigate, onLogout, account, roleLabel = 'Parish User', pendingCount = 0 }) {
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState(false);
  const name = account?.name || 'DIOganize User';

  const submit = (e) => {
    e.preventDefault();
    const term = search.trim();
    if (!term) return;
    window.dispatchEvent(new CustomEvent('dioganize-search', { detail: term }));
    onNavigate('Applications');
  };

  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu} aria-label="Open menu">☰</button>
      <form className="search-box" onSubmit={submit}>
        <Icon name="search" size={19} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." />
      </form>
      <div className="topbar-right">
        <button className="notification-button" onClick={() => onNavigate('Applications')} aria-label="Pending applications">
          <Icon name="bell" size={22} />
          {pendingCount > 0 && <i className="notif-dot" />}
        </button>
        <div className="profile-wrap">
          <button className="admin-profile" onClick={() => setMenu(!menu)}>
            {account?.photoURL ? <img src={account.photoURL} alt="" referrerPolicy="no-referrer" /> : <div className="avatar">{name.charAt(0).toUpperCase()}</div>}
            <span><strong>{name}</strong><small>{roleLabel}</small></span>
            <Icon name="chevron" size={16} />
          </button>
          {menu && <div className="profile-menu"><button onClick={onLogout}>Logout</button></div>}
        </div>
      </div>
    </header>
  );
}
