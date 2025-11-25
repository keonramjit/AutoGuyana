import React from 'react';

export default function GuyanaFlag({ className = "h-6 w-auto" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 720"
            className={className}
            aria-label="Flag of Guyana"
        >
            <rect width="1200" height="720" fill="#009e49" />
            <path fill="#fff" d="M0,0 1200,360 0,720z" />
            <path fill="#fcd116" d="M0,30 1080,360 0,690z" />
            <path fill="#000" d="M0,0 600,360 0,720z" />
            <path fill="#ce1126" d="M0,40 520,360 0,680z" />
        </svg>
    );
}
