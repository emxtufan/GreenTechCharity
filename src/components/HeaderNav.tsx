import React from 'react';
import { Language, PageData } from '../types';
import { PAGES_DATA, NAV_PAGES_KEYS } from '../data/siteData';

interface HeaderNavProps {
  lang: Language;
  activeUid: string;
  visible: boolean;
  onSelectPage: (uid: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  lang,
  activeUid,
  visible,
  onSelectPage,
}) => {
  const pagesList: PageData[] = NAV_PAGES_KEYS.map(
    (key) => PAGES_DATA[lang][key]
  ).filter(Boolean);

  const activeIndex = pagesList.findIndex((p) => p.uid === activeUid);

  return (
    <nav className={`_68f6d6 ${visible ? '_e09e15' : ''}`}>
      <div
        className="_df3134 gc-brand-logo-link"
        onClick={() => onSelectPage('index')}
        title="Acasa - GREENTECH Charity"
        aria-label="GREENTECH Charity"
      >
        <img
          className="gc-brand-logo gc-brand-logo--nav"
          src="/logo-charity.webp"
          alt="GREENTECH Charity"
          width="2418"
          height="2541"
        />
      </div>

      <div className="_68695a">
        {pagesList.map((page, l) => {
          if (page.uid === 'index' && l === 0) return null; // 'index' is the base project
          const isActive = l === activeIndex;
          const isHeader = l <= activeIndex;
          const colorClass =
            page.color === 'sand'
              ? '_f722b9'
              : page.color === 'lemon'
              ? '_6ebb2e'
              : '_53e7d7';

          const narrowClass = page.pointOfInterest ? '_c047d6' : '';

          return (
            <div
              key={page.uid}
              className={`_2680ad ${isHeader ? '_0ca877' : ''} ${
                isActive ? '_5257f8' : ''
              } ${colorClass} ${narrowClass}`}
              style={
                {
                  '--offset': `${(l - pagesList.length) * -1}`,
                  '--index': `${pagesList.length - (l - pagesList.length) * -1}`,
                } as React.CSSProperties
              }
              data-in-header={isHeader}
              data-pathname={page.uid}
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                  onSelectPage(isActive ? 'index' : page.uid);
                }}
                className={`_2bb0cd _7423af ${
                  page.color === 'lemon'
                    ? '_9655f4'
                    : page.color === 'forest'
                    ? '_864f6c'
                    : ''
                } ${isActive ? '_5a376b' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <span className="_14690a">
                  <svg
                    className="_6c8233"
                    viewBox="0 0 101 101"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 50.5C2.50001 23.9903 23.9903 2.50001 50.5 2.50001C77.0097 2.50001 98.5 23.9903 98.5 50.5C98.5 77.0097 77.0097 98.5 50.5 98.5C23.9903 98.5 2.5 77.0097 2.5 50.5Z"
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      className="_19c712"
                      d="M50.5 16.55V84.45"
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      d="M84.4502 50.5L16.5502 50.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
                <span className="_5862ff">
                  <span className="_fc3732">{page.title}</span>
                </span>
              </a>
              <div className="_9bef0c"></div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
