import React from 'react';

export const AddIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="currentColor"
    {...props}
  >
    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
  </svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (

  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="12" cy="12" rx="8" ry="5" fill="#fff" fillOpacity="0.2" />
    <ellipse cx="12" cy="12" rx="7" ry="4" fill="#fff" />
    <circle cx="12" cy="12" r="2" fill="#635FC7" />
    <ellipse cx="12" cy="12" rx="8" ry="5" stroke="#fff" strokeWidth="2" />
  </svg>
);

export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" /></svg>
);

