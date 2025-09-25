import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { UserMatch } from '@/api/entities';
import { Sweepstakes } from '@/api/entities';
import { Game } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Plus,
  Swords,
  Gamepad2,
  Trophy,
  Users,
  Clock,
  DollarSign,
  Heart,
  Sparkles,
  Upload,
  BarChart,
  Shield,
  Info,
  Link,
  Loader2
} from "lucide-react";

// Correctly import each function from its own file
import { createMatch } from '@/api/functions';
import { joinMatch } from '@/api/functions';
import { submitScore } from '@/api/functions';
import { finalizeMatch } from '@/api/functions';
import { getMatchStatus } from '@/api/functions/getMatchStatus';
import { shareProduct } from '@/api/functions';

import GameBrowser from '../components/match-creator/GameBrowser';
import ProductBrowser from '../components/match-creator/ProductBrowser';
import MatchPreview from '../components/match-creator/MatchPreview';
import SweepstakesCard from '../components/sweepstakes/SweepstakesCard';
import BrowserExtensionDemo from '../components/share/BrowserExtensionDemo';
import EnhancedUrlProcessor from '../components/share/EnhancedUrlProcessor';

const santaClauseConfig = {
  "disclosure": {
    "affiliate": "We may earn from qualifying purchases via retailer links.",
    "charity": "All platform profits route to the North Pole (Dear Santa) fund.",
    "fairness": "Skill contests are scored deterministically. Sweepstakes include a visible No-Purchase entry with equal odds and public draw proofs."
  },
  "featuredGames": [
    { "id": "skychess-blitz", "title": "SkyChess Blitz", "genre": "Board/Strategy", "mode": "skill", "playerCounts": [2,4,8], "avgMatchMinutes": 6, "description": "Fast chess puzzles, accuracy+time scoring. Server-verified." },
    { "id": "dash-drift-time-trial", "title": "Dash & Drift", "genre": "Racing / Time Trial", "mode": "skill", "playerCounts": [4,6,10], "avgMatchMinutes": 4, "description": "One track, three laps, clean runs score higher than raw speed." },
    { "id": "neon-arena-duel", "title": "Neon Arena", "genre": "Action / Arena", "mode": "skill", "playerCounts": [2,6,10], "avgMatchMinutes": 5, "description": "Hits, streaks, and survival time. Deterministic scoreboard." },
    { "id": "heavenly-draw", "title": "Heavenly Draw", "genre": "Sweepstakes", "mode": "sweepstakes", "playerCounts": [6,8,10], "avgMatchMinutes": 2, "description": "Equal-odds pool with paid and AMOE (free) entries; provably fair draw." }
  ],
  "featuredPrizes": [
    {
      "id": "nintendo-switch-oled", "title": "Nintendo Switch OLED", "category": "Gaming Console", "image_url": "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?q=80&w=400", "P": 34999,
      "uplift": { "marginPct": 0.05, "feesPct": 0.03, "bufferPct": 0.02 },
      "rooms": [ { "N": 10 }, { "N": 8 }, { "N": 6 }, { "N": 4 }, { "N": 2 } ]
    },
    {
      "id": "apple-airpods-pro", "title": "Apple AirPods Pro", "category": "Audio", "image_url": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=400", "P": 24900,
      "uplift": { "marginPct": 0.05, "feesPct": 0.03, "bufferPct": 0.02 },
      "rooms": [ { "N": 8 }, { "N": 6 }, { "N": 4 }, { "N": 2 } ]
    },
    {
      "id": "instant-pot", "title": "Instant Pot Duo", "category": "Home & Kitchen", "image_url": "https://images.unsplash.com/photo-1588708215982-f54817a0210f?q=80&w=400", "P": 9900,
      "uplift": { "marginPct": 0.05, "feesPct": 0.03, "bufferPct": 0.02 },
      "rooms": [ { "N": 10 }, { "N": 8 }, { "N": 6 }, { "N": 4 } ]
    },
     {
      "id": "lego-starship", "title": "LEGO Starship Set", "category": "Toys", "image_url": "https://images.unsplash.com/photo-1585366119957-e25a4b6c7128?q=80&w=400", "P": 12999,
      "uplift": { "marginPct": 0.05, "feesPct": 0.03, "bufferPct": 0.02 },
      "rooms": [ { "N": 10 }, { "N": 8 }, { "N": 6 }, { "N": 4 } ]
    }
  ],
  "ui": {
    "retailerPicker": {
      "quickLinks": ["Amazon","Walmart","Target","Best Buy","eBay","Apple","Microsoft","Home Depot","Nike","Wayfair"]
    }
  },
  "math": { "margin": 0.05, "feesPct": 0.03, "bufferPct": 0.02 }
};

const ceilToCents = (x) => Math.ceil(x);
const totalNeeded = (P_cents, u) => P_cents * (1 + u.marginPct + u.feesPct + u.bufferPct);
const buyInForPlayers = (P_cents, u, N) => ceilToCents(totalNeeded(P_cents, u) / N) / 100;

const ShareUrlProcessor = ({ onProductResolved }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProcessUrl = useCallback(async () => {
    setError('');
    if (!urlInput.trim()) {
      setError('Please enter a URL.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await shareProduct({ url: urlInput, source: 'web' });
      if (data.success && data.product) {
        onProductResolved(data.product);
        setUrlInput('');
      } else {
        throw new Error(data.error || 'Failed to process URL.');
      }
    } catch (err) {
      console.error('Error processing URL:', err);
      setError(err.message || 'Failed to process URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [urlInput, onProductResolved]);

  return (
    <Card className="bg-gradient-to-br from-blue-50/80 to-sky-100/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 mb-8">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="flex items-center gap-3 text-blue-800 text-2xl font-bold">
          <Link className="w-6 h-6 text-blue-600" />
          Share-to-App Product Ingest
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-blue-700 text-sm mb-4">
          Paste a product URL from any supported retailer. We'll attempt to ingest its details and make it available for a prize match!
        </p>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="url"
            placeholder="e.g., https://amazon.com/dp/B08QJ8H8J8"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-grow bg-white/70 border-blue-300 focus:border-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleProcessUrl}
            disabled={isLoading || !urlInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Ingesting..." : "Ingest Product"}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <p className="text-blue-600 text-xs mt-3">
          <span className="font-semibold">Demo Tip:</span> Try pasting an Amazon or Walmart product URL.
        </p>
      </CardContent>
    </Card>
  );
};

export default function SantaClause() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('arcade');
  const [isLoading, setIsLoading] = useState(true);
  const [sweepstakes, setSweepstakes] = useState([]);
  const [games, setGames] = useState([]);

  const [step, setStep] = useState(1);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [matchSettings, setMatchSettings] = useState({
    matchType: 'skill', minPlayers: 4, maxPlayers: 10, deadline: '', rules: '',
    verificationMethod: 'screenshot', charityPercentage: 10
  });
  const [calculatedBuyIn, setCalculatedBuyIn] = useState(0);
  
  const retailerDirectory = {
    "US Big Box & General": [
      { name: "Amazon", url: "https://amazon.com", logo: "📦", description: "Everything you need", apiSupported: true },
      { name: "Walmart", url: "https://walmart.com", logo: "🏪", description: "Save money. Live better.", apiSupported: true },
      { name: "Target", url: "https://target.com", logo: "🎯", description: "Expect more. Pay less.", apiSupported: true },
    ],
    "Electronics & Computers": [
      { name: "Best Buy", url: "https://bestbuy.com", logo: "🔵", description: "Tech and electronics", apiSupported: true },
      { name: "Apple", url: "https://apple.com", logo: "🍎", description: "Think different", apiSupported: true },
      { name: "Microsoft Store", url: "https://microsoft.com/store", logo: "🪟", description: "Microsoft products", apiSupported: true },
    ],
  };

  const loadSantaClauseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      const sampleSweepstakes = [{
        id: 'sweep-1', title: 'Win AirPods Pro 2', suggested_contribution_cents: 299,
        target_entries: 250, current_entries: 187, paid_entries: 142, amoe_entries: 45,
        status: 'OPEN', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }];
      setSweepstakes(sampleSweepstakes);
      const creatorGames = [
        { id: 'game-1', title: 'SkyChess Blitz', status: 'approved', owner_id: userData.id },
        { id: 'game-2', title: 'Rhythm Master', status: 'pending_review', owner_id: userData.id }
      ];
      setGames(creatorGames);
    } catch (error) {
      console.error('Error loading Santa Clause data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSantaClauseData();
  }, [loadSantaClauseData]);

  const calculateBuyIn = useCallback(() => {
    if (!selectedProduct) {
        setCalculatedBuyIn(0);
        return;
    }
    const P_cents = selectedProduct.price_cents;
    const { margin, feesPct, bufferPct } = santaClauseConfig.math;
    const uplift = { marginPct: margin, feesPct, bufferPct };

    const T_cents = totalNeeded(P_cents, uplift);
    const buyInPerPlayer_cents = ceilToCents(T_cents / matchSettings.maxPlayers);
    setCalculatedBuyIn(buyInPerPlayer_cents); // Keep in cents
  }, [selectedProduct, matchSettings.maxPlayers]);

  useEffect(() => {
    calculateBuyIn();
  }, [calculateBuyIn]);
  
  useEffect(() => {
    if (activeTab === 'create') {
      if (!selectedProduct) {
        setStep(1);
        setSelectedGame(null);
      } else {
        if (!selectedGame) {
          setStep(1);
        } else {
          setStep(3);
        }
      }
    }
  }, [activeTab, selectedGame, selectedProduct]);

  const TabButton = ({ id, label, icon: Icon, count = 0 }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
        activeTab === id
          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
          : 'bg-white/60 text-slate-600 hover:bg-white border border-slate-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && <Badge className="bg-blue-100 text-blue-800 text-xs">{count}</Badge>}
    </button>
  );

  const RetailerGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {santaClauseConfig.ui.retailerPicker.quickLinks.map((name) => (
        <Card
          key={name}
          className="bg-white/60 backdrop-blur-sm border-slate-200 hover:border-blue-300 transition-all cursor-pointer transform hover:scale-105"
          onClick={() => window.open(`https://www.${name.toLowerCase().replace(' ', '')}.com`, '_blank', 'noopener,noreferrer')}
        >
          <CardContent className="p-4 text-center">
            <h3 className="text-slate-800 font-semibold">{name}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const RetailerCategorySection = ({ category, retailers }) => (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">{category}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {retailers.map((retailer) => (
          <Card
            key={retailer.name}
            className="bg-white/70 backdrop-blur-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
            onClick={() => window.open(retailer.url, '_blank', 'noopener,noreferrer')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{retailer.logo}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {retailer.name}
                  </h4>
                  {retailer.apiSupported && (
                    <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                      API Supported
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-slate-600 text-sm">{retailer.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const FeaturedGameCard = ({ game }) => (
    <Card className="bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-blue-300 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-slate-800 text-lg">{game.title}</CardTitle>
        <Badge className="w-fit bg-blue-100 text-blue-800">{game.genre}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 text-sm mb-4">{game.description}</p>
        <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white">
          Play Now
        </Button>
      </CardContent>
    </Card>
  );

  const FeaturedPrizeCard = ({ prize }) => (
     <Card className="bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-blue-300 transition-all duration-300 flex flex-col">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="h-40 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
            <img src={prize.image_url} alt={prize.title} className="max-h-full max-w-full object-contain rounded-lg"/>
        </div>
        <h3 className="font-semibold text-slate-800 truncate flex-grow">{prize.title}</h3>
        <p className="text-sm text-slate-500">{prize.category}</p>

        <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-600 mb-2 text-center">Available Rooms</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
                {prize.rooms.map(room => {
                    const buyIn = buyInForPlayers(prize.P, prize.uplift, room.N);
                    return (
                        <div key={room.N} className="bg-slate-100/70 p-2 rounded-md">
                            <span className="text-xs text-slate-500">{room.N} Players</span>
                            <p className="font-bold text-slate-800">${buyIn.toFixed(2)}</p>
                        </div>
                    );
                })}
            </div>
        </div>

        <Button
            onClick={() => {
                const mockProduct = {
                  id: prize.id,
                  title: prize.title,
                  price_cents: prize.P,
                  offers: [{
                    retailer: 'mock-retailer',
                    price_cents: prize.P,
                    availability: 'in_stock'
                  }],
                  images: [prize.image_url],
                  brand: prize.category
                };
                setSelectedProduct(mockProduct);
                setActiveTab('create');
                setStep(1); 
            }}
            className="w-full mt-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white"
        >
            Create Match
        </Button>
      </CardContent>
    </Card>
  );

  const Disclosures = () => (
    <div className="bg-slate-100/70 backdrop-blur-sm border border-slate-200 rounded-xl p-4 mb-8 space-y-3">
        <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-500 mt-0.5" />
            <div>
                <h3 className="text-slate-700 font-semibold text-sm">Fairness & Transparency</h3>
                <p className="text-slate-600 text-xs">{santaClauseConfig.disclosure.fairness}</p>
            </div>
        </div>
        <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-slate-500 mt-0.5" />
            <div>
                <h3 className="text-slate-700 font-semibold text-sm">Charity Commitment</h3>
                <p className="text-slate-600 text-xs">{santaClauseConfig.disclosure.charity}</p>
            </div>
        </div>
        <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-500 mt-0.5" />
            <div>
                <h3 className="text-slate-700 font-semibold text-sm">Affiliate Disclosure</h3>
                <p className="text-slate-600 text-xs">{santaClauseConfig.disclosure.affiliate}</p>
            </div>
        </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-200 text-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-slate-200">
                <div className="h-32 bg-slate-200/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-200 text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                🎅 Santa Clause
              </h1>
              <p className="text-slate-500 text-lg">Prize Gaming • Skill Contests • Gift Giving</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <TabButton id="arcade" label="Prize Arcade" icon={Swords} />
          <TabButton id="create" label="Create Match" icon={Plus} />
          <TabButton id="shop" label="Shop" icon={DollarSign} count={Object.values(retailerDirectory).flat().length} />
          <TabButton id="sweepstakes" label="Sweepstakes" icon={Gift} count={sweepstakes.length} />
          <TabButton id="creator" label="Creator Portal" icon={Upload} count={games.length} />
        </div>

        {activeTab === 'arcade' && (
          <div>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">Featured Games</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {santaClauseConfig.featuredGames.map(game => <FeaturedGameCard key={game.id} game={game} />)}
              </div>
            </div>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">Trending Prizes</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {santaClauseConfig.featuredPrizes.map(prize => <FeaturedPrizeCard key={prize.id} prize={prize} />)}
              </div>
            </div>
             <Disclosures />
          </div>
        )}

        {activeTab === 'shop' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">🛍️ Shop Network</h2>
              <p className="text-slate-500 text-lg">Browse products from {Object.values(retailerDirectory).flat().length}+ trusted retail partners</p>
            </div>

            <div className="mb-8">
              <BrowserExtensionDemo onProductShared={(product) => {
                setSelectedProduct(product);
                setActiveTab('create');
                setStep(1); 
              }} />
            </div>

            <div className="mb-8">
              <EnhancedUrlProcessor onProductResolved={(product) => {
                setSelectedProduct(product);
                setActiveTab('create');
                setStep(1); 
              }} />
            </div>

            <div className="mb-8">
              <ShareUrlProcessor onProductResolved={(product) => {
                setSelectedProduct(product);
                setActiveTab('create');
                setStep(1); 
              }} />
            </div>

            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-800 font-semibold text-lg mb-2">Cross-Platform Integration & Compliance</h3>
                  <div className="space-y-2 text-blue-700 text-sm">
                    <p><strong>🔗 Browser Extensions:</strong> Right-click any product page on supported sites to instantly create prize matches.</p>
                    <p><strong>📱 Mobile Share:</strong> iOS and Android share sheets let you send products directly from retailer apps.</p>
                    <p><strong>🌐 PWA Share Target:</strong> System-level sharing on macOS and Android via web app manifest integration.</p>
                    <p><strong>⚖️ URL Canonicalization:</strong> All URLs are cleaned, validated against allowlists, and product IDs extracted securely.</p>
                    <p><strong>💰 Price Freshness:</strong> Real-time price verification with drift detection and TTL enforcement per retailer policies.</p>
                  </div>
                </div>
              </div>
            </div>

            {Object.entries(retailerDirectory).map(([category, retailers]) => (
              <RetailerCategorySection key={category} category={category} retailers={retailers} />
            ))}

          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white/50 backdrop-blur-md border border-slate-200 p-8 rounded-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">🎮 Create Prize Match</h2>
              <p className="text-slate-500">Choose any game and search for any retail product to create your match!</p>
            </div>

            {step === 1 && (
              <div>
                <h3 className="text-2xl font-bold text-slate-700 mb-6">Step 1: Choose a Mobile Game</h3>
                <GameBrowser onGameSelect={(game) => { setSelectedGame(game); setStep(2); }} />
              </div>
            )}

            {step === 2 && (
              <div>
                <Button variant="link" onClick={() => { setSelectedGame(null); setStep(1); }}>&larr; Back to Game Selection</Button>
                <h3 className="text-2xl font-bold text-slate-700 my-6">Step 2: Find Your Prize</h3>
                <ProductBrowser onProductSelect={(product) => { setSelectedProduct(product); setStep(3); }} />
              </div>
            )}

            {step === 3 && selectedGame && selectedProduct && (
              <MatchPreview
                game={selectedGame}
                product={selectedProduct}
                settings={matchSettings}
                buyIn={calculatedBuyIn}
                onConfirm={async (matchDetails) => {
                  try {
                      const { data } = await createMatch({
                        ...matchDetails,
                        productOffer: matchDetails.productOffer
                      });
                      if(data.success) {
                          alert("Match created successfully!");
                          setActiveTab('arcade'); 
                          setStep(1); 
                          setSelectedGame(null); 
                          setSelectedProduct(null); 
                      } else {
                          throw new Error(data.error || "Failed to create match");
                      }
                  } catch (err) {
                      console.error("Error creating match:", err);
                      alert(`Error: ${err.message}`);
                  }
                }}
                onBack={() => { setSelectedProduct(null); setStep(2); }}
              />
            )}
          </div>
        )}

        {activeTab === 'sweepstakes' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">🎁 Sweepstakes</h2>
              <p className="text-slate-500">Enter to win with our AMOE-compliant sweepstakes!</p>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-semibold">Legal & Fair</h3>
                  <p className="text-slate-600 text-sm">
                    🔸 <strong>No Purchase Necessary</strong> - Free AMOE entry available for all sweepstakes<br />
                    🔸 <strong>Equal Odds</strong> - Paid and free entries have identical winning chances<br />
                    🔸 <strong>Provably Fair</strong> - All draws use verifiable randomness with public proofs
                  </p>
                </div>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sweepstakes.map((sweep) => (
                <SweepstakesCard key={sweep.id} sweepstakes={sweep} user={user} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'creator' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">👨‍💻 Creator Portal</h2>
              <p className="text-slate-500">Submit your games and create prize matches for the community!</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              {games.map(game => (
                <Card key={game.id} className="bg-white/60 border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-800">{game.title}</CardTitle>
                      <Badge className={game.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {game.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Game status and management controls would go here.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}