export interface NewsItem {
  tag: string
  headline: string
  date: string
  href?: string
}

const STATIC_NEWS: NewsItem[] = [
  {
    tag: 'RESEARCH',
    headline: 'FUnIE-GAN training pipeline deployed on Kaggle GPU',
    date: 'Mar 2026',
  },
  {
    tag: 'INTELLIGENCE',
    headline: 'FAISS vector store integrated with configurable threat rules',
    date: 'Mar 2026',
  },
  {
    tag: 'DASHBOARD',
    headline: 'React operator dashboard with dual-theme support launched',
    date: 'Mar 2026',
  },
]

export const NewsSection = () => (
  <section className="landing-section reveal">
    <div className="landing-container">
      <div className="news-head">
        <div>
          <div className="landing-overline">UPDATES</div>
          <h2 className="landing-headline">Latest from the project.</h2>
        </div>
        <a href="#top" style={{ color: '#94A3B8', fontSize: 14 }}>
          View all updates &#8594;
        </a>
      </div>

      <div className="news-grid">
        {STATIC_NEWS.map((item) => (
          <article className="news-card" key={item.headline}>
            <div className="news-tag mono">{item.tag}</div>
            <h3 className="news-title">{item.headline}</h3>
            <div className="mono" style={{ fontSize: 11, color: '#475569' }}>
              {item.date}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)
