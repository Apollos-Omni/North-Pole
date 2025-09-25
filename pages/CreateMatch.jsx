
import React, { useState, useEffect, useCallback } from 'react';
import { MobileGame } from '@/api/entities';
import { Product } from '@/api/entities';
import { UserMatch } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Gamepad2, ShoppingCart, Trophy, Calculator } from 'lucide-react';

import GameBrowser from '../components/match-creator/GameBrowser';
import ProductBrowser from '../components/match-creator/ProductBrowser';
import MatchPreview from '../components/match-creator/MatchPreview';

export default function CreateMatch() {
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(1); // 1: Game, 2: Product, 3: Settings, 4: Review
    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [matchSettings, setMatchSettings] = useState({
        matchType: 'skill',
        minPlayers: 4,
        maxPlayers: 10,
        deadline: '',
        rules: '',
        verificationMethod: 'screenshot',
        charityPercentage: 10
    });
    const [calculatedBuyIn, setCalculatedBuyIn] = useState(0);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
            } catch (error) {
                console.error('Error loading user:', error);
            }
        };
        loadUser();
    }, []);

    const calculateBuyIn = useCallback(() => {
        if (!selectedProduct) return;
        
        const P = selectedProduct.price_cents; // Product price
        const M = Math.round(P * 0.10); // 10% margin
        const F = Math.round(P * 0.03); // 3% fees
        const B = Math.round(P * 0.02); // 2% buffer
        const C = Math.round((M * matchSettings.charityPercentage) / 100); // Charity portion
        
        const totalPot = P + M + F + B;
        const buyInPerPlayer = Math.ceil(totalPot / matchSettings.maxPlayers);
        
        setCalculatedBuyIn(buyInPerPlayer);
    }, [selectedProduct, matchSettings.maxPlayers, matchSettings.charityPercentage]);

    useEffect(() => {
        if (selectedProduct && matchSettings.maxPlayers) {
            calculateBuyIn();
        }
    }, [selectedProduct, matchSettings.maxPlayers, matchSettings.charityPercentage, calculateBuyIn]);

    const createMatch = async () => {
        try {
            const matchData = {
                created_by: user.id,
                mobile_game_id: selectedGame.id,
                product_id: selectedProduct.id,
                match_type: matchSettings.matchType,
                min_players: matchSettings.minPlayers,
                max_players: matchSettings.maxPlayers,
                buy_in_cents: calculatedBuyIn,
                deadline: matchSettings.deadline,
                rules: matchSettings.rules,
                verification_method: matchSettings.verificationMethod,
                charity_percentage: matchSettings.charityPercentage
            };

            await UserMatch.create(matchData);
            alert('Match created successfully!');
            // Redirect to match page
            
        } catch (error) {
            console.error('Error creating match:', error);
            alert('Failed to create match');
        }
    };

    const StepIndicator = ({ currentStep, totalSteps }) => (
        <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
                <React.Fragment key={stepNum}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        stepNum <= currentStep 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'border-purple-300 text-purple-300'
                    }`}>
                        {stepNum}
                    </div>
                    {stepNum < totalSteps && (
                        <div className={`w-20 h-0.5 ${
                            stepNum < currentStep ? 'bg-purple-600' : 'bg-purple-300'
                        }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text text-transparent mb-4">
                        Create Prize Match
                    </h1>
                    <p className="text-purple-200/80">Choose a game, pick a prize, set the rules</p>
                </div>

                <StepIndicator currentStep={step} totalSteps={4} />

                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold text-purple-200 mb-6 flex items-center gap-2">
                            <Gamepad2 className="w-6 h-6" />
                            Step 1: Choose a Game
                        </h2>
                        <GameBrowser 
                            onGameSelect={(game) => {
                                setSelectedGame(game);
                                setStep(2);
                            }}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold text-purple-200 mb-6 flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6" />
                            Step 2: Choose a Prize
                        </h2>
                        {selectedGame && (
                            <div className="mb-6 p-4 bg-black/40 rounded-lg border border-purple-700/30">
                                <p className="text-purple-300 text-sm">Selected Game:</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <img src={selectedGame.icon_url} alt={selectedGame.title} className="w-12 h-12 rounded-lg" />
                                    <div>
                                        <h3 className="font-semibold text-white">{selectedGame.title}</h3>
                                        <p className="text-purple-300 text-sm">{selectedGame.developer}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <ProductBrowser 
                            onProductSelect={(product) => {
                                setSelectedProduct(product);
                                setStep(3);
                            }}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="text-2xl font-bold text-purple-200 mb-6 flex items-center gap-2">
                            <Trophy className="w-6 h-6" />
                            Step 3: Match Settings
                        </h2>
                        
                        {/* Show selections */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {selectedGame && (
                                <Card className="bg-black/40 border-purple-700/30">
                                    <CardHeader><CardTitle className="text-purple-200">Selected Game</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <img src={selectedGame.icon_url} alt={selectedGame.title} className="w-12 h-12 rounded-lg" />
                                            <div>
                                                <h3 className="font-semibold text-white">{selectedGame.title}</h3>
                                                <p className="text-purple-300 text-sm">{selectedGame.developer}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            
                            {selectedProduct && (
                                <Card className="bg-black/40 border-purple-700/30">
                                    <CardHeader><CardTitle className="text-purple-200">Selected Prize</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <img src={selectedProduct.image_urls?.[0]} alt={selectedProduct.title} className="w-12 h-12 rounded-lg object-cover" />
                                            <div>
                                                <h3 className="font-semibold text-white">{selectedProduct.title}</h3>
                                                <p className="text-green-400 font-semibold">${(selectedProduct.price_cents / 100).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Settings form */}
                        <Card className="bg-black/40 border-purple-700/30">
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-purple-300">Match Type</Label>
                                        <Select 
                                            value={matchSettings.matchType} 
                                            onValueChange={(value) => setMatchSettings(prev => ({...prev, matchType: value}))}
                                        >
                                            <SelectTrigger className="bg-purple-900/30 border-purple-700/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="skill">Skill Contest</SelectItem>
                                                <SelectItem value="sweepstakes">Sweepstakes (AMOE)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-purple-300">Max Players</Label>
                                        <Select 
                                            value={matchSettings.maxPlayers.toString()} 
                                            onValueChange={(value) => setMatchSettings(prev => ({...prev, maxPlayers: parseInt(value)}))}
                                        >
                                            <SelectTrigger className="bg-purple-900/30 border-purple-700/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[4, 6, 8, 10, 16, 20, 25, 50].map(num => (
                                                    <SelectItem key={num} value={num.toString()}>{num} Players</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-purple-300">Verification Method</Label>
                                        <Select 
                                            value={matchSettings.verificationMethod} 
                                            onValueChange={(value) => setMatchSettings(prev => ({...prev, verificationMethod: value}))}
                                        >
                                            <SelectTrigger className="bg-purple-900/30 border-purple-700/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="screenshot">Screenshot Proof</SelectItem>
                                                <SelectItem value="video">Video Proof</SelectItem>
                                                <SelectItem value="api">API Integration</SelectItem>
                                                <SelectItem value="honor_system">Honor System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-purple-300">Match Deadline</Label>
                                        <Input 
                                            type="datetime-local"
                                            value={matchSettings.deadline}
                                            onChange={(e) => setMatchSettings(prev => ({...prev, deadline: e.target.value}))}
                                            className="bg-purple-900/30 border-purple-700/50 text-white"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label className="text-purple-300">Custom Rules</Label>
                                        <Textarea 
                                            value={matchSettings.rules}
                                            onChange={(e) => setMatchSettings(prev => ({...prev, rules: e.target.value}))}
                                            placeholder="Additional rules or instructions for players..."
                                            className="bg-purple-900/30 border-purple-700/50 text-white"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* Buy-in calculation */}
                                {calculatedBuyIn > 0 && (
                                    <div className="mt-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calculator className="w-5 h-5 text-green-400" />
                                            <h3 className="font-semibold text-green-300">Calculated Buy-in</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-green-400">Product Cost</p>
                                                <p className="text-white font-semibold">${(selectedProduct?.price_cents / 100).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-400">Platform Fee</p>
                                                <p className="text-white font-semibold">${((selectedProduct?.price_cents || 0) * 0.10 / 100).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-400">To Charity</p>
                                                <p className="text-white font-semibold">${((selectedProduct?.price_cents || 0) * 0.10 * matchSettings.charityPercentage / 10000).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-400">Buy-in Per Player</p>
                                                <p className="text-white font-bold text-lg">${(calculatedBuyIn / 100).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between mt-8">
                            <Button variant="outline" onClick={() => setStep(2)} className="border-purple-700/50 text-purple-300">
                                Back
                            </Button>
                            <Button onClick={() => setStep(4)} className="bg-purple-600 hover:bg-purple-700">
                                Review & Create
                            </Button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <h2 className="text-2xl font-bold text-purple-200 mb-6">Step 4: Review & Create</h2>
                        
                        <MatchPreview 
                            game={selectedGame}
                            product={selectedProduct}
                            settings={matchSettings}
                            buyIn={calculatedBuyIn}
                            onConfirm={createMatch}
                            onBack={() => setStep(3)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
