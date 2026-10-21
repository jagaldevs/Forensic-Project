import type { Media } from '../engine/missionTypes';
import { CityMap } from '../apps/map/CityMap';
import shared from '../apps/shared/shared.module.css';
import a from './academy.module.css';

/** Photos, maps and tables shown alongside a mission step. */
export function MediaView({ items }: { items: Media[] }) {
  return (
    <div className={a.media}>
      {items.map((m, i) => {
        if (m.kind === 'photo')
          return (
            <div
              key={i}
              className={items.length === 1 ? `${a.mediaSolo} ${a.mediaWide}` : undefined}
            >
              <figure className={a.photo} style={{ margin: 0 }}>
                <img src={m.src} alt={m.alt} />
                {m.caption && <figcaption className={a.photoCaption}>{m.caption}</figcaption>}
                {m.metadata && (
                  <table className={shared.kv}>
                    <caption className="visually-hidden">Photo metadata</caption>
                    <tbody>
                      {m.metadata.map((row) => (
                        <tr key={row.label}>
                          <th scope="row">{row.label}</th>
                          <td>
                            {row.value}
                            {row.note && <span className={shared.kvNote}>{row.note}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </figure>
            </div>
          );
        if (m.kind === 'map')
          return (
            <div key={i} className={a.mediaWide}>
              <CityMap circle={m.circle} markers={m.markers ?? []} description={m.description} />
            </div>
          );
        return (
          <div key={i} className={`${shared.tableWrap} ${a.mediaWide}`}>
            <table className={shared.table}>
              <caption
                className={a.instruction}
                style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)' }}
              >
                {m.caption}
              </caption>
              <thead>
                <tr>
                  {m.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {m.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} style={m.mono ? undefined : { fontFamily: 'var(--font-ui)' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
