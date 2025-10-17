import React from 'react';
import BugForm from './components/BugForm';

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo" />
          <div className="brand-title">BugDraft</div>
        </div>
        <div className="muted">Draft Jira bugs with AI</div>
      </header>
      <BugForm />
    </div>
  );
}


