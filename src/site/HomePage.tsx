import { Link } from 'react-router-dom';
import { useSeo } from './useSeo';
import { useSiteData } from '../data/context';
import HtmlFrame from './HtmlFrame';

export default function HomePage() {
  const { settings, categories, entries, entriesByCategory } = useSiteData();
  const { hero } = settings;

  useSeo({ title: settings.siteName, description: hero.lead, path: '/' });

  return (
    <div className="home">
      <section className="hero">
        <span className="hero__eyebrow">
          {hero.eyebrow || `${entries.length} components · ${categories.length} categories`}
        </span>
        <h1 className="hero__title">
          {hero.title}
          {hero.accent && (
            <>
              <br />
              <span className="hero__accent">{hero.accent}</span>
            </>
          )}
        </h1>
        <p className="hero__lead">{hero.lead}</p>
        <div className="hero__actions">
          <Link to={`/components/${entries[0]?.slug}`} className="btn btn--primary">
            Browse components
          </Link>
          <a href="#categories" className="btn btn--ghost">
            See categories
          </a>
        </div>
      </section>

      <div id="categories">
        {categories.map((cat) => {
          const items = entriesByCategory(cat.id);
          if (items.length === 0) return null;
          return (
            <section key={cat.id} className="gallery">
              <header className="gallery__head">
                <h2>{cat.label}</h2>
                <p>{cat.description}</p>
              </header>
              <div className="gallery__grid">
                {items.map(({ slug, name, description, Component, srcdoc, previewUrl, stage, isNew, variants, source }) => (
                  <Link key={slug} to={`/components/${slug}`} className="tile">
                    <div className={`tile__preview tile__preview--${stage ?? 'center'}`} aria-hidden="true" inert>
                      <div className="tile__scale">
                        {Component ? (
                          <Component />
                        ) : previewUrl ? (
                          <HtmlFrame src={previewUrl} title={name} lazy />
                        ) : (
                          srcdoc !== undefined && <HtmlFrame srcdoc={srcdoc} title={name} lazy trusted={source === 'builtin'} />
                        )}
                      </div>
                    </div>
                    <div className="tile__body">
                      <h3>
                        {name}
                        {isNew && <span className="tag-new">New</span>}
                      </h3>
                      <p>{description}</p>
                      <div className="lang-chips lang-chips--small">
                        {variants.map((v) => (
                          <span key={v.language} className={`lang-chip lang-chip--${v.language}`}>
                            {v.language === 'react' ? 'React' : 'HTML'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
