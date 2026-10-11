import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Play, Download, Heart, Share2, Clock, Globe,
  ChevronRight, Lock, Crown, Flag, ThumbsUp, Send,
  Film, Calendar, ArrowLeft
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoPlayer from '@/components/features/VideoPlayer';
import StarRatingWidget from '@/components/features/StarRatingWidget';
import MovieCard from '@/components/features/MovieCard';
import { useLanguage } from '@/hooks/useLanguage';
import { MOVIES } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MOCK_CAST = [
  { id: 'c1', name: 'Timothée Chalamet', role: 'Paul Atreides', avatar: 'https://i.pravatar.cc/80?img=11' },
  { id: 'c2', name: 'Zendaya', role: 'Chani', avatar: 'https://i.pravatar.cc/80?img=12' },
  { id: 'c3', name: 'Rebecca Ferguson', role: 'Lady Jessica', avatar: 'https://i.pravatar.cc/80?img=13' },
  { id: 'c4', name: 'Josh Brolin', role: 'Gurney Halleck', avatar: 'https://i.pravatar.cc/80?img=14' },
  { id: 'c5', name: 'Austin Butler', role: 'Feyd-Rautha', avatar: 'https://i.pravatar.cc/80?img=15' },
  { id: 'c6', name: 'Florence Pugh', role: 'Princess Irulan', avatar: 'https://i.pravatar.cc/80?img=16' },
];

const MOCK_REVIEWS = [
  { id: 'r1', user: 'Ahmad K.', avatar: 'https://i.pravatar.cc/40?img=21', rating: 9, text: 'An absolute visual masterpiece. Denis Villeneuve has outdone himself with this epic continuation. The world-building is breathtaking.', likes: 48, time: '2 days ago' },
  { id: 'r2', user: 'Sara M.', avatar: 'https://i.pravatar.cc/40?img=22', rating: 8, text: 'Stunning cinematography and great performances. The second half especially delivers on its promise. A must-watch for sci-fi fans.', likes: 31, time: '5 days ago' },
  { id: 'r3', user: 'Omar R.', avatar: 'https://i.pravatar.cc/40?img=23', rating: 7, text: 'Great movie overall, though the pacing is slow in places. Still one of the best sci-fi films in years.', likes: 19, time: '1 week ago' },
  { id: 'r4', user: 'Fatima H.', avatar: 'https://i.pravatar.cc/40?img=24', rating: 10, text: 'Perfect in every way. The sand worm scenes alone are worth the price of admission. Truly epic filmmaking.', likes: 67, time: '2 weeks ago' },
];

const MOCK_SUBSCRIPTION_ACTIVE = false;

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useLanguage();
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);

  const movie = MOVIES.find(m => m.id === id) || MOVIES[0];
  const related = MOVIES.filter(m => m.id !== movie.id && m.genre.some(g => movie.genre.includes(g))).slice(0, 6);

  const isLocked = movie.accessType === 'subscription' && !MOCK_SUBSCRIPTION_ACTIVE;
  const displayTitle = language === 'fa' ? movie.titleFa : movie.title;
  const displayDesc = language === 'fa' ? movie.descriptionFa : movie.description;

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
        <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Back button */}
        <div className="absolute top-20 left-4">
          <Link
            to={`/${language}/movies`}
            className="flex items-center gap-2 px-3 py-2 glass border border-white/10 rounded-xl text-sm text-foreground/80 hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

          {/* Left: Poster + Actions */}
          <div className="hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
              <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
              {movie.isNew && (
                <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-black bg-primary text-white rounded-lg">NEW</span>
              )}
              {movie.isTrending && (
                <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-black bg-orange-500 text-white rounded-lg">TRENDING</span>
              )}
            </div>

            {/* Quick info */}
            <div className="mt-4 glass border border-white/5 rounded-2xl p-4 space-y-3">
              {[
                { icon: Calendar, label: 'Year', value: movie.year.toString() },
                { icon: Clock, label: 'Duration', value: `${movie.duration} min` },
                { icon: Globe, label: 'Country', value: movie.country },
                { icon: Film, label: 'Access', value: movie.accessType === 'free' ? 'Free' : 'Subscription' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </span>
                  <span className={cn(
                    'font-medium',
                    item.label === 'Access' && movie.accessType === 'free' ? 'text-green-400' :
                    item.label === 'Access' ? 'text-primary' : 'text-foreground'
                  )}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Main Content */}
          <div className="space-y-6 pt-4 lg:pt-0">
            {/* Title + Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {movie.genre.map(g => (
                  <Link
                    key={g}
                    to={`/${language}/movies`}
                    className="px-2.5 py-1 text-xs font-semibold glass border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-all"
                  >
                    {g}
                  </Link>
                ))}
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-foreground leading-tight">{displayTitle}</h1>
              {language === 'en' && movie.titleFa && (
                <p className="text-base text-muted-foreground mt-1 font-rtl">{movie.titleFa}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xl font-black text-foreground">{movie.rating}</span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                <span className="text-sm text-muted-foreground">{movie.year}</span>
                <span className="text-sm text-muted-foreground">{movie.duration} min</span>
                <span className="text-sm text-muted-foreground">{movie.country}</span>
                <span className={cn(
                  'px-2.5 py-0.5 text-xs font-bold rounded-lg',
                  movie.accessType === 'free' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
                )}>
                  {movie.accessType === 'free' ? 'FREE' : 'SUBSCRIPTION'}
                </span>
              </div>
            </div>

            {/* Video Player */}
            <VideoPlayer
              embedUrl={movie.embedUrl}
              thumbnail={movie.backdrop}
              title={displayTitle}
              contentId={movie.id}
              isLocked={isLocked}
              language={language}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {isLocked ? (
                <Link
                  to={`/${language}/subscriptions`}
                  className="flex items-center gap-2 px-6 py-2.5 gradient-brand text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  <Crown className="w-4 h-4" /> Subscribe to Watch
                </Link>
              ) : (
                <button className="flex items-center gap-2 px-6 py-2.5 gradient-brand text-white font-bold rounded-xl hover:opacity-90 transition-all">
                  <Play className="w-4 h-4 fill-white" /> Watch Now
                </button>
              )}

              <button
                onClick={handleDownload}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all border',
                  isLocked
                    ? 'glass border-white/10 text-muted-foreground cursor-not-allowed'
                    : 'glass border-primary/30 text-primary hover:bg-primary/10'
                )}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                Download
              </button>

              <button
                onClick={handleFavorite}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border',
                  isFavorited
                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'glass border-white/10 text-muted-foreground hover:text-foreground'
                )}
              >
                <Heart className={cn('w-4 h-4', isFavorited && 'fill-red-400')} />
                {isFavorited ? 'Saved' : 'Favorite'}
              </button>

              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm glass border border-white/10 text-muted-foreground rounded-xl hover:text-foreground transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="glass border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Synopsis</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">{displayDesc}</p>
            </div>

            {/* Mobile Poster Info */}
            <div className="lg:hidden grid grid-cols-2 gap-2">
              {[
                { icon: Calendar, label: 'Year', value: movie.year.toString() },
                { icon: Clock, label: 'Duration', value: `${movie.duration} min` },
                { icon: Globe, label: 'Country', value: movie.country },
              ].map(item => (
                <div key={item.label} className="glass border border-white/5 rounded-xl p-3 flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cast */}
            <div>
              <h2 className="text-base font-bold text-foreground mb-4">Cast & Crew</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {MOCK_CAST.map(person => (
                  <div key={person.id} className="text-center group cursor-pointer">
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 border border-white/10 group-hover:border-primary/40 transition-colors">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={e => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${person.name}&background=0A1035&color=4F8EF7`)}
                      />
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{person.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{person.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Widget */}
            <div className="glass border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">Rate This Movie</h2>
              <StarRatingWidget
                initialRating={movie.rating}
                totalRatings={Math.floor(Math.random() * 50000) + 10000}
                size="md"
              />
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                User Reviews
                <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
              </h2>

              {/* Write Review */}
              <div className="glass border border-white/5 rounded-2xl p-4 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Write a Review</p>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this movie..."
                  rows={3}
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmitReview}
                    className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Review
                  </button>
                </div>
              </div>

              {/* Review List */}
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
                      <button
                        onClick={() => handleLikeReview(review.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                          likedReviews.has(review.id)
                            ? 'bg-primary/20 border-primary/30 text-primary'
                            : 'glass border-white/10 text-muted-foreground hover:text-foreground'
                        )}
                      >
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

            {/* Related Movies */}
            {related.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-foreground">Related Movies</h2>
                  <Link to={`/${language}/movies`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    See All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                  {related.map(m => (
                    <MovieCard key={m.id} item={m} type="movie" />
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
