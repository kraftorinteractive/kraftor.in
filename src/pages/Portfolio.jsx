import { useState } from 'react'
import FilterTabs from '../components/ui/FilterTabs'
import HScroller from '../components/ui/HScroller'
import Reveal from '../components/ui/Reveal'
import ReelCard from '../components/ui/ReelCard'
import YouTubeCard from '../components/ui/YouTubeCard'
import SiteCard from '../components/ui/SiteCard'
import AppCard from '../components/ui/AppCard'
import PageHeader from '../components/layout/PageHeader'
import TypeText from '../components/ui/TypeText'
import usePageTitle from '../hooks/usePageTitle'
import useTabParam from '../hooks/useTabParam'
import { portfolioTabs, reelSections, siteSections, apps, appHeader } from '../data/portfolio'
import './pages.css'

/** Section heading + one line of info, above each row of cards. */
function SecHead({ title, text, count }) {
  return (
    <div className="pf-sec__head">
      <h2 className="pf-sec__title">
        <TypeText text={title} speed={35} inView /> <Reveal as="span" className="pf-sec__count">{count}</Reveal>
      </h2>
      {text && <TypeText as="p" className="pf-sec__text" text={text} speed={14} inView caret={false} />}
    </div>
  )
}

/** One row of video cards in the right shape for its layout. */
function VideoRow({ layout, items }) {
  if (layout === 'reel') {
    return (
      <HScroller size="reel" cols={5} scrollDesktop={items.length > 5}>
        {items.map((r) => <ReelCard key={r.id} reel={r} />)}
      </HScroller>
    )
  }
  return (
    <HScroller cols={layout === 'youtube' ? 3 : 2}>
      {items.map((r) =>
        layout === 'youtube' ? <YouTubeCard key={r.id} item={r} /> : <ReelCard key={r.id} reel={r} wide />
      )}
    </HScroller>
  )
}

/** A video section; sections with `groups` get a small Portrait / Landscape switch. */
function VideoSection({ sec }) {
  const [groupKey, setGroupKey] = useState(sec.groups?.[0].key)
  const group = sec.groups?.find((g) => g.key === groupKey)
  const items = group ? group.items : sec.items

  return (
    <section className="pf-sec">
      <SecHead title={sec.title} text={sec.text} count={items.length} />
      {sec.groups && (
        <Reveal className="pf-sub" role="tablist" aria-label={`${sec.title} format`}>
          {sec.groups.map((g) => (
            <button
              key={g.key}
              role="tab"
              aria-selected={g.key === groupKey}
              className={`pf-sub__btn${g.key === groupKey ? ' is-active' : ''}`}
              onClick={() => setGroupKey(g.key)}
            >
              <span className={`pf-sub__shape pf-sub__shape--${g.key}`} aria-hidden="true" />
              {g.label}
            </button>
          ))}
        </Reveal>
      )}
      <VideoRow key={groupKey} layout={group ? group.layout : sec.layout} items={items} />
    </section>
  )
}

// Heading + line under the filter change with the selected tab
const intro = {
  animation: { title: 'Stories in motion', text: 'Motion graphics, 3D, AI videos and campus films.' },
  web: { title: 'Websites that work', text: 'Fast, mobile-first sites for brands in India and abroad.' },
  app: { title: 'Apps people use', text: 'Simple, useful apps built for Android.' },
}

export default function Portfolio() {
  usePageTitle('Portfolio')
  const [tab, setTab] = useTabParam(portfolioTabs.map((t) => t.key))

  return (
    <>
      <PageHeader crumb="Portfolio" title={intro[tab].title} text={intro[tab].text}>
        <FilterTabs tabs={portfolioTabs} active={tab} onChange={setTab} label="Portfolio category" />
      </PageHeader>

      <div className="container page-body" key={tab}>
        {tab === 'animation' && reelSections.map((sec) => <VideoSection key={sec.key} sec={sec} />)}

        {tab === 'web' &&
          siteSections.map((sec) => (
            <section key={sec.key} className="pf-sec">
              <SecHead title={sec.title} text={sec.text} count={sec.items.length} />
              <HScroller cols={3}>
                {sec.items.map((s) => <SiteCard key={s.id} site={s} />)}
              </HScroller>
            </section>
          ))}

        {tab === 'app' && (
          <section className="pf-sec">
            <SecHead title={appHeader.title} text={appHeader.text} count={apps.length} />
            <Reveal stagger variant="fade" className="st-grid">
              {apps.map((a) => <AppCard key={a.id} app={a} />)}
            </Reveal>
          </section>
        )}
      </div>
    </>
  )
}
