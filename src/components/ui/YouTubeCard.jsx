import { useState } from 'react'
import { FaPlay } from 'react-icons/fa'
import './cards.css'

/**
 * 16:9 YouTube card. Shows the thumbnail first and only loads the player
 * when tapped, so the page stays fast. Uses youtube-nocookie for privacy.
 */
export default function YouTubeCard({ item }) {
  const [playing, setPlaying] = useState(false)
  return (
    <article className="reel reel--wide">
      <div className="reel__frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button className="yt__thumb" onClick={() => setPlaying(true)} aria-label={`Play ${item.title}`}>
            <img src={item.poster} alt="" loading="lazy" />
            <span className="yt__play"><FaPlay /></span>
          </button>
        )}
      </div>
      <h4 className="reel__title">{item.title}</h4>
      <p className="reel__type">{item.type}</p>
    </article>
  )
}
