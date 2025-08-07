import React from 'react';
import Header from './Header';

// Example usage of the Header component
const HeaderExample: React.FC = () => {
  const handleTemplateClick = () => {
    console.log('Template button clicked');
    // This would open the template modal
  };

  const handleSettingsClick = () => {
    console.log('Settings button clicked');
    // This would open the settings modal
  };

  return (
    <div>
      <Header
        onTemplateClick={handleTemplateClick}
        onSettingsClick={handleSettingsClick}
        title="운동 타이머"
      />
      
      <div style={{ padding: '20px' }}>
        <p>Header component example with:</p>
        <ul>
          <li>Left: Template button (opens template selection modal)</li>
          <li>Center: App title</li>
          <li>Right: Settings button (opens settings modal)</li>
        </ul>
        <p>The header is responsive and includes proper accessibility features.</p>
      </div>
    </div>
  );
};

export default HeaderExample;