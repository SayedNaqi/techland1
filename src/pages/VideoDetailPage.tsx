import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { localizedPath } from '@/constants/opportunityRoutes';
import VideoPlayer from '@/components/features/VideoPlayer';
import NativePlayer from '@/components/features/NativePlayer';
import AdSlot from '@/components/features/AdSlot';
import SuggestedRow from '@/components/features/SuggestedRow';
import { useVideo, useVideos } from '@/lib/videos';
import { currentUser } from '@/lib/accounts';
import { apiMe, getUserToken, isBackendEnabled, mediaUrl } from '@/lib/api';

export default function VideoDetailPage({ slug }: { slug: string }) {
  const { language } = useLanguage();
  const { video, backend } = useVideo(slug);
  const { videos: movies } = useVideos('movie');
  const { videos: series } = useVideos('series');
  const [partIndex, setPartIndex] = useState(0);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => setPartIndex(0), [slug]);

  // Subscription gate: free videos always play; subscription videos need an
  // active membership (server profile when backend is on, demo profile otherwise).
  useEffect(() => {
    if (!video || video.accessType === 'free') {
      setAllowed(true);
      return;
    }
    if (!isBackendEnabled) {
      setAllowed(currentUser()?.subscriptionStatus === 'active');
      return;
    }
    const token = getUserToken();
    if (!token) {
      setAllowed(false);
      return;
    }
    setAllowed(null);
    apiMe(token)
      .then((r) => setAllowed(r.user.subscriptionStatus === 'active'))
      .catch(() => setAllowed(false));
  }, [video]);

  if (video === undefined) {
    return (
      <div className="pathway-page"><section className="pathway-section"><div className="pathway-container"><p>{language === 'fa' ? 'در حال بارگذاری…' : 'Loading…'}</p></div></section></div>
    );
  }

  if (video === null) {
    return (
      <div className="pathway-page">
        <section className="pathway-page-intro"><div className="pathway-container">
          <p className="pathway-eyebrow">404</p>
          <h1>{language === 'fa' ? 'ویدیو یافت نشد' : 'Video not found'}</h1>
          <p><Link className="opp-link" to={localizedPath('/movies/', language)}>← {language === 'fa' ? 'بازگشت' : 'Back'}</Link></p>
        </div></section>
      </div>
    );
  }

  const title = video.title[language] || video.title.en;
  const part = video.parts[Math.min(partIndex, Math.max(video.parts.length - 1, 0))];
  const hasPlayable = !!part?.embedUrl || !!part?.directUrl;
  // Self-hosted file wins: native TechLand player, zero third-party branding.
  const directSrc = part?.directUrl ? mediaUrl(part.directUrl) : '';
  const suggestions = video.kind === 'movie' ? movies : series;

  return (
    <div className="pathway-page">
      <section className="pathway-page-intro">
        <div className="pathway-container">
          <p><Link className="opp-link" to={localizedPath(video.kind === 'movie' ? '/movies/' : '/series/', language)}>
            <ArrowLeft size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> {language === 'fa' ? (video.kind === 'movie' ? 'فیلم‌ها' : 'سریال‌ها') : video.kind === 'movie' ? 'Movies' : 'Series'}
          </Link></p>
          <h1 style={{ marginTop: 8 }}>{title}</h1>
          <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {video.year && <span>{video.year}</span>}
            {video.rating != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Star size={13} />{video.rating}</span>}
            {video.country && <span>{video.country}</span>}
            {video.kind === 'series' && (video.seasons ? <span>S{video.seasons}{video.episodes ? ` · ${video.episodes}E` : ''}</span> : null)}
            <span style={{ fontSize: 11, fontWeight: 700, background: video.accessType === 'free' ? '#e7f6ec' : '#e9effe', color: video.accessType === 'free' ? '#1c7a3d' : '#2859a8', borderRadius: 6, padding: '2px 8px' }}>
              {video.accessType === 'free' ? (language === 'fa' ? 'رایگان' : 'Free') : (language === 'fa' ? 'اشتراکی' : 'Subscription')}
            </span>
          </p>
        </div>
      </section>

      <section className="pathway-section">
        <div className="pathway-container" style={{ display: 'grid', gap: 18 }}>
          <AdSlot slot="watch_top" />
          {allowed === null ? (
            <p>{language === 'fa' ? 'در حال بررسی اشتراک…' : 'Checking subscription…'}</p>
          ) : allowed && hasPlayable ? (
            directSrc ? (
              <NativePlayer
                key={`${video.slug}-${partIndex}`}
                src={directSrc}
                poster={video.backdropUrl || video.posterUrl}
                title={part.label[language] ? `${title} — ${part.label[language]}` : title}
                language={language}
                storageKey={`${video.slug}:${partIndex}`}
                onEnded={() => {
                  if (partIndex < video.parts.length - 1) setPartIndex(partIndex + 1);
                }}
              />
            ) : (
              <VideoPlayer
                key={`${video.slug}-${partIndex}`}
                embedUrl={part.embedUrl}
                source={part.source}
                thumbnail={video.backdropUrl || video.posterUrl || ''}
                title={part.label[language] ? `${title} — ${part.label[language]}` : title}
                language={language}
              />
            )
          ) : allowed && !hasPlayable ? (
            <div className="legal-notice"><div>
              <h2>{language === 'fa' ? 'پخش تنظیم نشده' : 'Playback not configured'}</h2>
              <p>{backend
                ? language === 'fa' ? 'برای این ویدیو لینک پخش ثبت نشده است.' : 'No playback link registered for this video.'
                : language === 'fa' ? 'این نمونه نمایشی لینک پخش ندارد؛ با اتصال بک‌اند، ویدیوهای واقعی با لینک OK/VK پخش می‌شوند.' : 'This sample has no playback link; with the backend connected, real OK/VK/Bunny videos play here.'}</p>
            </div></div>
          ) : (
            <div className="legal-notice"><div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <Lock size={26} />
              <div>
                <h2 style={{ margin: 0 }}>{language === 'fa' ? 'نیاز به اشتراک فعال' : 'Active subscription required'}</h2>
                <p style={{ margin: '6px 0 10px' }}>{language === 'fa' ? 'برای تماشای این ویدیو عضویت فعال لازم است.' : 'An active membership is required to watch this video.'}</p>
                <Link className="pathway-button" to={localizedPath('/payment/', language)}>{language === 'fa' ? 'خرید اشتراک' : 'Get subscription'}</Link>
              </div>
            </div></div>
          )}

          {video.parts.length > 1 && (
            <div>
              <h3 style={{ color: '#07114f', margin: '4px 0 10px' }}>{language === 'fa' ? 'قسمت‌ها' : 'Episodes'}</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {video.parts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPartIndex(i)}
                    className={i === partIndex ? 'pathway-button' : 'pathway-button pathway-button--secondary'}
                    style={{ minHeight: 38 }}
                  >
                    {p.label[language] || p.label.en || `${language === 'fa' ? 'قسمت' : 'Ep'} ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(video.description[language] || video.genre.length > 0) && (
            <div className="directory-filters">
              {video.genre.length > 0 && (
                <p style={{ margin: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {video.genre.map((g) => (
                    <span key={g} style={{ fontSize: 11, background: '#eef2f8', color: '#41506b', borderRadius: 8, padding: '3px 10px' }}>{g}</span>
                  ))}
                </p>
              )}
              {video.description[language] && <p style={{ margin: '10px 0 0', fontSize: 14, color: '#35445d', lineHeight: 1.9 }}>{video.description[language]}</p>}
            </div>
          )}

          {!backend && (
            <p className="directory-local-note">
              {language === 'fa'
                ? 'پیش‌نمایش بدون سرور: این فهرست نمونه و خیالی است. با اتصال بک‌اند، ویدیوهای واقعی که ادمین اضافه می‌کند نمایش داده می‌شود.'
                : 'Serverless preview: this listing is a fictional sample. With the backend connected, real admin-added videos appear.'}
            </p>
          )}

          <AdSlot slot="watch_bottom" />
          <SuggestedRow
            videos={suggestions}
            currentSlug={video.slug}
            title={language === 'fa' ? 'شاید بپسندید' : 'You may also like'}
          />
        </div>
      </section>
    </div>
  );
}
