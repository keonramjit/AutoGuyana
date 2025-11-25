import React from 'react';

const IconBase = ({ children, className = "w-12 h-12" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {children}
    </svg>
);

export const SedanIcon = (props) => (
    <IconBase {...props}>
        <path d="M14 8h-4L8 10H6c-1.1 0-2 .9-2 2v4h16v-4c0-1.1-.9-2-2-2h-2l-2-2z" />
        <path d="M6 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        <path d="M18 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        <path d="M2 16h2" />
        <path d="M20 16h2" />
    </IconBase>
);

export const SUVIcon = (props) => (
    <IconBase {...props}>
        <path d="M5 10h14l-1.5-4h-11L5 10z" />
        <path d="M3 10h18v6H3v-6z" />
        <path d="M5.5 16a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" />
        <path d="M18.5 16a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" />
    </IconBase>
);

export const CoupeIcon = (props) => (
    <IconBase {...props}>
        <path d="M13 8H9l-4 4H3v4h18v-4h-2l-6-4z" />
        <path d="M5 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        <path d="M19 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        <path d="M2 16h1" />
        <path d="M21 16h1" />
    </IconBase>
);

export const HatchbackIcon = (props) => (
    <IconBase {...props}>
        <path d="M4 10h16v6H4v-6z" />
        <path d="M4 10l2-4h10l2 4" />
        <path d="M6 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        <path d="M18 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        <path d="M22 13v3" />
    </IconBase>
);

export const TruckIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 12h18v5H3v-5z" />
        <path d="M3 12l2-4h6l1 4" />
        <path d="M5.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" />
        <path d="M18.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" />
        <path d="M16 12V9h5v3" />
    </IconBase>
);

export const VanIcon = (props) => (
    <IconBase {...props}>
        <path d="M2 10h20v7H2v-7z" />
        <path d="M4 10l2-5h13l1 5" />
        <path d="M5.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" />
        <path d="M18.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" />
        <path d="M10 5v12" />
    </IconBase>
);

export const ConvertibleIcon = (props) => (
    <IconBase {...props}>
        <path d="M4 12h16v4H4v-4z" />
        <path d="M4 12l3-3h8" />
        <path d="M6 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        <path d="M18 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
    </IconBase>
);

export const WagonIcon = (props) => (
    <IconBase {...props}>
        <path d="M4 10h16v6H4v-6z" />
        <path d="M4 10l2-4h12l2 4" />
        <path d="M6 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        <path d="M18 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
    </IconBase>
);
