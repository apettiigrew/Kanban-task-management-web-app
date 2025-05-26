'use client';

// This component imports the markdown editor's CSS file and sets the color mode
// for proper light/dark mode integration

import React, { useEffect } from 'react';
// import 'react-markdown/react-markdown.min.js';
// import '@uiw/react-md-editor/markdown-editor.css';
// import '@uiw/react-markdown-preview/markdown.css';

export function MarkdownEditorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set the color mode attribute on document for the markdown editor
    // You can enhance this to detect user's preferred color mode
    document.documentElement.setAttribute('data-color-mode', 'light');
    
    // Optional: Add a listener for system color scheme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      document.documentElement.setAttribute(
        'data-color-mode',
        e.matches ? 'dark' : 'light'
      );
    };
    
    // Set initial value
    handleColorSchemeChange(darkModeMediaQuery);
    
    // Listen for changes
    darkModeMediaQuery.addEventListener('change', handleColorSchemeChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }, []);

  return <>{children}</>;
}
