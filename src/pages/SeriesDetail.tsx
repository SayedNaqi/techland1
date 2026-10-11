import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Play, Download, Heart, Share2, Globe,
  ChevronRight, Lock, Crown, Flag, ThumbsUp, Send,
  Tv, Calendar, ArrowLeft, ChevronDown, CheckCircle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoPlayer from '@/components/features/VideoPlayer';
import StarRatingWidget from '@/components/features/StarRatingWidget';
import { useLanguage } from '@/hooks/useLanguage';
import { SERIES } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MOCK_CAST = [
  { id: 'c1', name: 'Bryan Cranston', role: 'Walter White', avatar: 'https://i.pravatar.cc/80?img=31' },
  { id: 'c2', name: 'Aaron Paul', role: 'Jesse Pinkman', avatar: 'https://i.pravatar.cc/80?img=32' },
  { id: 'c3', name: 'Anna Gunn', role: 'Skyler White', avatar: 'https://i.pravatar.cc/80?img=33' },
  { id: 'c4', name: 'Dean Norris', role: 'Hank Schrader', avatar: 'https://i.pravatar.cc/80?img=34' },
  { id: 'c5', name: 'Bob Odenkirk', role: 'Saul Goodman', avatar: 'https://i.pravatar.cc/80?img=35' },
  { id: 'c6', name: 'Giancarlo Esposito', role: 'Gus Fring', avatar: 'https://i.pravatar.cc/80?img=36' },
];

const MOCK_EPISODES: Record<number, { ep: number; title: string; duration: string; watched: boolean }[]> = {
  1: [
    { ep: 1, title: 'Pilot', duration: '58 min', watched: true },
    { ep: 2, title: "Cat's in the Bag", duration: '48 min', watched: true },
    { ep: 3, title: "...and the Bag's in the River", duration: '48 min', watched: true },
    { ep: 4, title: 'Cancer Man', duration: '48 min', watched: false },
    { ep: 5, title: 'Gray Matter', duration: '48 min', watched: false },
    { ep: 6, title: 'Crazy Handful of Nothin', duration: '48 min', watched: false },
    { ep: 7, title: 'A No-Rough-Stuff-Type Deal', duration: '48 min', watched: false },
  ],
  2: [
    { ep: 1, title: 'Seven Thirty-Seven', duration: '47 min', watched: false },
    { ep: 2, title: 'Grilled', duration: '47 min', watched: false },
    { ep: 3, title: 'Bit by a Dead Bee', duration: '47 min', watched: false },
    { ep: 4, title: 'Down', duration: '47 min', watched: false },
    { ep: 5, title: 'Breakage', duration: '47 min', watched: false },
  ],
};

const MOCK_REVIEWS = [
  { id: 'r1', user: 'Film Critic', avatar: 'https://i.pravatar.cc/40?img=41', rating: 10, text: 'The greatest television series ever made. Bryan Cranston delivers an unforgettable performance throughout every season.', likes: 124, time: '1 week ago' },
  { id: 'r2', user: 'TV Enthusiast', avatar: 'https://i.pravatar.cc/40?img=42', rating: 9, text: 'The character development is unparalleled. Walter White\'s transformation is handled with absolute mastery.', likes: 87, time: '2 weeks ago' },
  { id: 'r3', user: 'Drama Fan', avatar: 'https://i.pravatar.cc/40?img=43', rating: 9, text: 'Every episode keeps you on the edge of your seat. The writing is phenomenal from start to finish.', likes: 55, time: '3 weeks ago' },
];

const MOCK_SUBSCRIPTION_ACTIVE = false;

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useLanguage();
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);

  const series = SERIES.find(s => s.id === id) || SERIES[0];
  const related = SERIES.filter(s => s.id !== series.id && s.genre.some(g => series.genre.includes(g))).slice(0, 3);

  const isLocked = series.accessType === 'subscription' && !MOCK_SUBSCRIPTION_ACTIVE;
  const displayTitle = language === 'fa' ? series.titleFa : series.title;
  const displayDesc = language === 'fa' ? series.descriptionFa : series.description;

  const seasons = Array.from({ length: series.seasons }, (_, i) => i + 1);
  const currentEpisodes = MOCK_EPISODES[selectedSeason] || MOCK_EPISODES[1];

  const handleFavorite = () => {
    setIsFavorited(f => !f);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDownload = () => {
    if (isLocked) {
      toast.error('Subscription required to download');
    } else {
      toast.success('Download started...');
    }
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) { toast.error('Please write something first'); return; }
    const newReview = {
      id: `r${Date.now()}`,
      user: 'You',
      avatar: 'https://i.pravatar.cc/40?img=99',
      rating: 8,
      text: reviewText.trim(),
      likes: 0,
      time: 'Just now',
    };
    setReviews(prev => [newReview, ...prev]);
    setReviewText('');
    toast.success('Review posted!');
  };

  const handleLikeReview = (reviewId: string) => {
    setLikedReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
        setReviews(rs => rs.map(r => r.id === reviewId ? { ...r, likes: r.likes - 1 } : r));
      } else {
        next.add(reviewId);
        setReviews(rs => rs.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1 } : r));
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />

      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[300px] overflow-hidden">
        <img src={series.backdrop} alt={series.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        <div className="absolute top-20 left-4">
          <Link
            to={`/${language}/series`}
            className="flex items-center gap-2 px-3 py-2 glass border border-white/10 rounded-xl text-sm text-foreground/80 hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Series
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

          {/* Left: Poster */}
          <div className="hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
              <img src={series.poster} alt={series.title} className="w-full aspect-[2/3] object-cover" />
              {series.isNew && (
                <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-black bg-primary text-white rounded-lg">NEW</span>
              )}
            </div>
            <div className="mt-4 glass border border-white/5 rounded-2xl p-4 space-y-3">
              {[
                { icon: Calendar, label: 'Year', value: series.year.toString() },
                { icon: Tv, label: 'Seasons', value: `${series.seasons} Seasons` },
                { icon: Tv, label: 'Episodes', value: `${series.episodes} Episodes` },
                { icon: Globe, label: 'Country', value: series.country },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-6 pt-4 lg:pt-0">
            {/* Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {series.genre.map(g => (
                  <Link key={g} to={`/${language}/series`}
                    className="px-2.5 py-1 text-xs font-semibold glass border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-all">
                    {g}
                  </Link>
                ))}
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-foreground leading-tight">{displayTitle}</h1>
              {language === 'en' && series.titleFa && (
                <p className="text-base text-muted-foreground mt-1 font-rtl">{series.titleFa}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xl font-black text-foreground">{series.rating}</span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                <span className="text-sm text-muted-foreground">{series.year}</span>
                <span className="text-sm text-muted-foreground">{series.seasons}S / {series.episodes}E</span>
                <span className={cn('px-2.5 py-0.5 text-xs font-bold rounded-lg',
                  series.accessType === 'free' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
                )}>
                  {series.accessType === 'free' ? 'FREE' : 'SUBSCRIPTION'}
                </span>
              </div>
            </div>

            {/* Video Player */}
            <VideoPlayer
              thumbnail={series.backdrop}
              title={displayTitle}
              contentId={series.id}
              isLocked={isLocked}
              language={language}
            />

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {isLocked ? (
                <Link to={`/${language}/subscriptions`}
                  className="flex items-center gap-2 px-6 py-2.5 gradient-brand text-white font-bold rounded-xl hover:opacity-90 transition-all">
                  <Crown className="w-4 h-4" /> Subscribe to Watch
                </Link>
              ) : (
                <button className="flex items-center gap-2 px-6 py-2.5 gradient-brand text-white font-bold rounded-xl hover:opacity-90 transition-all">
                  <Play className="w-4 h-4 fill-white" /> Continue Watching
                </button>
              )}
              <button onClick={handleDownload}
                className={cn('flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all border',
                  isLocked ? 'glass border-white/10 text-muted-foreground cursor-not-allowed' : 'glass border-primary/30 text-primary hover:bg-primary/10'
                )}>
                {isLocked ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                Download
              </button>
              <button onClick={handleFavorite}
                className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border',
                  isFavorited ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'glass border-white/10 text-muted-foreground hover:text-foreground'
                )}>
                <Heart className={cn('w-4 h-4', isFavorited && 'fill-red-400')} />
                {isFavorited ? 'Saved' : 'Favorite'}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm glass border border-white/10 text-muted-foreground rounded-xl hover:text-foreground transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Synopsis */}
            <div className="glass border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Synopsis</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">{displayDesc}</p>
            </div>

            {/* Episode List */}
            <div className="glass border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">Episodes</h2>
                {/* Season Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {seasons.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeason(s)}
                      className={cn(
                        'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                        selectedSeason === s ? 'gradient-brand text-white' : 'glass border border-white/10 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      S{s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {currentEpisodes.map(ep => (
                  <div key={ep.ep} className={cn(
                    'flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group',
                    isLocked && 'opacity-60'
                  )}>
                    <div className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {ep.ep}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{ep.title}</p>
                      <p className="text-xs text-muted-foreground">{ep.duration}</p>
                    </div>
                    {ep.watched && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <button className="flex items-center gap-1 px-2.5 py-1 gradient-brand text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <Play className="w-3 h-3 fill-white" /> Play
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cast */}
            <div>
              <h2 className="text-base font-bold text-foreground mb-4">Cast & Crew</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {MOCK_CAST.map(person => (
                  <div key={person.id} className="text-center group cursor-pointer">
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 border border-white/10 group-hover:border-primary/40 transition-colors">
                      <img src={person.avatar} alt={person.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={e => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${person.name}&background=0A1035&color=4F8EF7`)} />
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{person.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{person.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Widget */}
            <div className="glass border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">Rate This Series</h2>
              <StarRatingWidget
                initialRating={series.rating}
                totalRatings={Math.floor(Math.random() * 80000) + 20000}
                size="md"
              />
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                User Reviews
                <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
              </h2>

              <div className="glass border border-white/5 rounded-2xl p-4 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Write a Review</p>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this series..."
                  rows={3}
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button onClick={handleSubmitReview}
                    className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
                    <Send className="w-3.5 h-3.5" /> Post Review
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map(review => (
                  <div key={review.id} className="glass border border-white/5 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <img src={review.avatar} alt={review.user} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{review.user}</p>
                          <p className="text-xs text-muted-foreground">{review.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 glass border border-yellow-400/20 rounded-lg">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400">{review.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{review.text}</p>
                    <div className="flex items-center justify-between mt-3">
                      <button onClick={() => handleLikeReview(review.id)}
                        className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                          likedReviews.has(review.id) ? 'bg-primary/20 border-primary/30 text-primary' : 'glass border-white/10 text-muted-foreground hover:text-foreground'
                        )}>
                        <ThumbsUp className={cn('w-3 h-3', likedReviews.has(review.id) && 'fill-primary')} />
                        {review.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors">
                        <Flag className="w-3 h-3" /> Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Series */}
            {related.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-foreground">Related Series</h2>
                  <Link to={`/${language}/series`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    See All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {related.map(s => (
                    <Link key={s.id} to={`/${language}/series/${s.id}`}
                      className="glass border border-white/5 rounded-2xl overflow-hidden card-hover">
                      <img src={s.poster} alt={s.title} className="w-full h-36 object-cover" />
                      <div className="p-3">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{language === 'fa' ? s.titleFa : s.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400">{s.rating}</span>
                          <span className="text-[10px] text-muted-foreground">{s.seasons}S</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
