import React, { useState } from 'react';
import { PageData, Language } from '../types';
import { HISTORY_ITEMS, NAV_PAGES_KEYS, PAGES_DATA } from '../data/siteData';
import { TimelineOverlay } from './TimelineOverlay';

interface PageCardProps {
  page: PageData;
  lang: Language;
  visible: boolean;
  onSelectPage: (uid: string) => void;
}

export const PageCard: React.FC<PageCardProps> = ({
  page,
  lang,
  visible,
  onSelectPage,
}) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rooms: 'donatie',
    message: '',
  });

  const pagesList = NAV_PAGES_KEYS.map((key) => PAGES_DATA[lang][key]).filter(
    Boolean
  );
  const activeIndex = pagesList.findIndex((p) => p.uid === page.uid);

  const startOffset = activeIndex > -1 ? activeIndex + 1 : 1;
  const endOffset =
    activeIndex > -1 ? pagesList.length - (activeIndex + 1) : 0;

  const colorClass =
    page.color === 'lemon'
      ? '_889852'
      : page.color === 'forest'
      ? '_b977da'
      : '';

  const narrowClass = page.pointOfInterest ? '_79c599' : '';
  const newsClass = page.news ? '_eb71cf' : '';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div
      className={`_190b32 _6b1088 ${visible ? '_3111dd' : ''} _1be840 ${colorClass} ${narrowClass} ${newsClass}`}
      style={
        {
          '--start': `${startOffset}`,
          '--end': `${endOffset}`,
        } as React.CSSProperties
      }
    >
      <div className="_18d1bd"></div>

      <div className="_9622f0 _1ee20c">
        <div className="_c1b0c0">
          {/* Facts Section */}
          {page.facts && page.facts.length > 0 && (
            <div className="_2d7757">
              <div className="_ab40f5">
                {page.facts.map((fact, idx) => (
                  <div
                    key={idx}
                    className={`_187561 _b4c3f7 ${
                      fact.column === 'Right' ? '_0dfbe7' : ''
                    }`}
                  >
                    <h3 className="_d010ea">{fact.title}</h3>
                    <div style={{ fontSize: 'var(--text-s)', marginTop: '0.25em' }}>
                      {fact.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline on News page */}
          {page.news && (
            <div className="_2d7757">
              <TimelineOverlay items={HISTORY_ITEMS[lang]} />
            </div>
          )}

          {/* Main Column */}
          <div className="_f72612">
            <div className="_9d6b51">
              <h1>{page.title}</h1>
              {page.paragraphs?.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Apartments Table if present */}
            {page.apartments && (
              <div style={{ marginTop: '1em' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 'var(--text-s)',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '1px solid currentColor', opacity: 0.7 }}>
                      <th style={{ padding: '0.5em 0' }}>Proiect</th>
                      <th style={{ padding: '0.5em 0' }}>Beneficiari</th>
                      <th style={{ padding: '0.5em 0' }}>Suprafata</th>
                      <th style={{ padding: '0.5em 0' }}>Spatiu exterior</th>
                      <th style={{ padding: '0.5em 0' }}>Finantare</th>
                      <th style={{ padding: '0.5em 0' }}>Stadiu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.apartments.map((apt) => (
                      <tr
                        key={apt.id}
                        style={{ borderBottom: '1px solid rgba(31,58,39,0.15)' }}
                      >
                        <td style={{ padding: '0.75em 0', fontWeight: 600 }}>
                          {apt.id}
                        </td>
                        <td style={{ padding: '0.75em 0' }}>{apt.rooms}</td>
                        <td style={{ padding: '0.75em 0' }}>{apt.size}</td>
                        <td style={{ padding: '0.75em 0' }}>{apt.outdoor}</td>
                        <td style={{ padding: '0.75em 0', fontWeight: 600 }}>
                          {apt.price}
                        </td>
                        <td style={{ padding: '0.75em 0' }}>
                          <span
                            style={{
                              padding: '0.2em 0.6em',
                              borderRadius: '1em',
                              backgroundColor:
                                apt.status === 'Disponibila' || apt.status === 'In lucru'
                                  ? 'var(--lemon)'
                                  : 'rgba(31,58,39,0.1)',
                              fontSize: '0.85em',
                              fontWeight: 500,
                            }}
                          >
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Contact Form on Contact Page */}
            {page.uid === 'kontakt' && (
              <div style={{ marginTop: '1.5em' }}>
                {formSubmitted ? (
                  <div
                    style={{
                      padding: '1.5em',
                      backgroundColor: 'var(--lemon)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--forest)',
                      fontWeight: 500,
                    }}
                  >
                    Multumim pentru mesaj! Echipa GREENTECH Charity te va contacta in curand.
                  </div>
                ) : (
                  <form
                    onSubmit={handleFormSubmit}
                    style={{
                      display: 'grid',
                      gap: '1em',
                      maxWidth: '32rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 'var(--text-xs)',
                          marginBottom: '0.3em',
                        }}
                      >
                        Nume complet *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: '0.6em 0.8em',
                          border: '1px solid currentColor',
                          borderRadius: '0.5em',
                          background: 'transparent',
                          fontFamily: 'inherit',
                          fontSize: 'var(--text-s)',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1em' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: 'var(--text-xs)',
                            marginBottom: '0.3em',
                          }}
                        >
                          E-mail *
                        </label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.6em 0.8em',
                            border: '1px solid currentColor',
                            borderRadius: '0.5em',
                            background: 'transparent',
                            fontFamily: 'inherit',
                            fontSize: 'var(--text-s)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: 'var(--text-xs)',
                            marginBottom: '0.3em',
                          }}
                        >
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.6em 0.8em',
                            border: '1px solid currentColor',
                            borderRadius: '0.5em',
                            background: 'transparent',
                            fontFamily: 'inherit',
                            fontSize: 'var(--text-s)',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 'var(--text-xs)',
                          marginBottom: '0.3em',
                        }}
                      >
                        Cum vrei sa te implici
                      </label>
                      <select
                        value={formData.rooms}
                        onChange={(e) =>
                          setFormData({ ...formData, rooms: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: '0.6em 0.8em',
                          border: '1px solid currentColor',
                          borderRadius: '0.5em',
                          background: 'transparent',
                          fontFamily: 'inherit',
                          fontSize: 'var(--text-s)',
                        }}
                      >
                        <option value="donatie">Donatie</option>
                        <option value="voluntariat">Voluntariat</option>
                        <option value="parteneriat">Parteneriat</option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 'var(--text-xs)',
                          marginBottom: '0.3em',
                        }}
                      >
                        Mesaj
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: '0.6em 0.8em',
                          border: '1px solid currentColor',
                          borderRadius: '0.5em',
                          background: 'transparent',
                          fontFamily: 'inherit',
                          fontSize: 'var(--text-s)',
                        }}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="_ab4318"
                      style={{
                        justifySelf: 'start',
                        cursor: 'pointer',
                        marginTop: '0.5em',
                      }}
                    >
                      <span>Trimite mesajul</span>
                      <svg
                        className="_806e1d"
                        viewBox="0 0 101 101"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          vectorEffect="non-scaling-stroke"
                          d="M2.5 50.5C2.50001 23.9903 23.9903 2.50001 50.5 2.50001C77.0097 2.50001 98.5 23.9903 98.5 50.5C98.5 77.0097 77.0097 98.5 50.5 98.5C23.9903 98.5 2.5 77.0097 2.5 50.5Z"
                        />
                        <path
                          d="M50.5 16.55V84.45"
                          vectorEffect="non-scaling-stroke"
                        />
                        <path
                          d="M84.4502 50.5L16.5502 50.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Links section */}
            {page.links && page.links.length > 0 && (
              <div className="_e81189" style={{ marginTop: '1.5em' }}>
                {page.links.map((lnk, idx) => (
                  <a key={idx} href={lnk.url} className="_ab4318">
                    <span>{lnk.text}</span>
                    <svg
                      className="_806e1d"
                      viewBox="0 0 101 101"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        vectorEffect="non-scaling-stroke"
                        d="M2.5 50.5C2.50001 23.9903 23.9903 2.50001 50.5 2.50001C77.0097 2.50001 98.5 23.9903 98.5 50.5C98.5 77.0097 77.0097 98.5 50.5 98.5C23.9903 98.5 2.5 77.0097 2.5 50.5Z"
                      />
                      <path
                        d="M50.5 16.55V84.45"
                        vectorEffect="non-scaling-stroke"
                      />
                      <path
                        d="M84.4502 50.5L16.5502 50.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="_0b3d52">
          <footer className="_5b8182">
            <div>GREENTECH Charity &copy; {new Date().getFullYear()}</div>
            <div>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  onSelectPage('kontakt');
                }}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                Transparenta si confidentialitate
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
