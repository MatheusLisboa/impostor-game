import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Play, 
  Settings, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Timer, 
  RotateCcw,
  Home as HomeIcon,
  BookOpen,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useThemes, Theme } from './lib/useThemes';
import { cn } from './lib/utils';

// --- Types ---
interface GameState {
  players: number;
  impostors: number;
  theme: Theme | null;
  word: string;
  hint: string;
  roles: ('player' | 'impostor')[];
  currentPlayerIndex: number;
  isRevealed: boolean;
  gameStarted: boolean;
  gameOver: boolean;
}

// --- Context ---
const GameContext = createContext<{
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  resetGame: () => void;
} | null>(null);

const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};

// --- Components ---

const Button = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button 
    className={cn(
      "w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2",
      "bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:pointer-events-none",
      className
    )}
    {...props}
  />
);

const PrimaryButton = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button 
    className={cn("bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20", className)}
    {...props}
  />
);

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("bg-zinc-900 border border-zinc-800 rounded-3xl p-6", className)} {...props}>
    {children}
  </div>
);

// --- Views ---

const Home = () => {
  const navigate = useNavigate();
  const { loading } = useThemes();
  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-4"
      >
        <Users size={64} className="text-white" />
      </motion.div>
      
      <div className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter text-white">IMPOSTOR</h1>
        <p className="text-zinc-400 text-lg max-w-xs mx-auto">
          Um jogo de dedução social. Quem está mentindo?
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-xs text-zinc-500">Sincronizando temas...</p>
          </div>
        ) : (
          <>
            <PrimaryButton onClick={() => navigate('/setup')}>
              <Play fill="currentColor" /> JOGAR AGORA
            </PrimaryButton>
            <Button onClick={() => navigate('/themes')}>
              <BookOpen /> TEMAS
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const GameSetup = () => {
  const navigate = useNavigate();
  const { themes, loading } = useThemes();
  const { state, setState } = useGame();

  const handleStart = () => {
    let selectedTheme = state.theme;
    if (!selectedTheme && themes.length > 0) {
      // Random theme logic if none selected (or if we add a specific random button)
      selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    }
    
    if (!selectedTheme) {
      toast.error('Escolha um tema ou aguarde o carregamento');
      return;
    }
    
    // Logic to shuffle roles and pick word
    let word = '';
    let hint = '';
    
    if (selectedTheme.id === 'all') {
      const allWords = themes.flatMap(t => t.words || []);
      if (allWords.length === 0) {
        toast.error('Nenhuma palavra encontrada nos temas');
        return;
      }
      const rawWord = allWords[Math.floor(Math.random() * allWords.length)];
      word = typeof rawWord === 'string' ? rawWord : rawWord.palavra;
      hint = typeof rawWord === 'string' ? '' : rawWord.dica;
    } else {
      if (!selectedTheme.words || selectedTheme.words.length === 0) {
        toast.error('Este tema não possui palavras');
        return;
      }
      const rawWord = selectedTheme.words[Math.floor(Math.random() * selectedTheme.words.length)];
      word = typeof rawWord === 'string' ? rawWord : rawWord.palavra;
      hint = typeof rawWord === 'string' ? '' : rawWord.dica;
    }

    const roles: ('player' | 'impostor')[] = Array(state.players).fill('player');
    for (let i = 0; i < state.impostors; i++) {
      roles[i] = 'impostor';
    }
    // Shuffle roles
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    setState(prev => ({
      ...prev,
      theme: selectedTheme,
      word,
      hint,
      roles,
      gameStarted: true,
      currentPlayerIndex: 0,
      isRevealed: false
    }));
    navigate('/play');
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 bg-zinc-800 rounded-full">
          <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold">Configuração</h2>
      </div>

      <Card className="space-y-6">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-zinc-400 font-medium">
            <Users size={18} /> Jogadores: {state.players}
          </label>
          <input 
            type="range" min="3" max="20" 
            value={state.players} 
            onChange={(e) => setState(prev => ({ ...prev, players: parseInt(e.target.value) }))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-zinc-400 font-medium">
            <UserPlus size={18} /> Impostores: {state.impostors}
          </label>
          <input 
            type="range" min="1" max={Math.floor(state.players / 2)} 
            value={state.impostors} 
            onChange={(e) => setState(prev => ({ ...prev, impostors: parseInt(e.target.value) }))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={18} /> Escolha o Tema
          </h3>
          <button 
            onClick={() => {
              if (themes.length === 0) {
                toast.error('Nenhum tema disponível ainda');
                return;
              }
              const randomTheme = themes[Math.floor(Math.random() * themes.length)];
              setState(prev => ({ ...prev, theme: randomTheme }));
              toast.info(`Tema aleatório selecionado: ${randomTheme.name}`);
            }}
            className="text-xs font-bold text-indigo-400 bg-indigo-600/10 px-3 py-1 rounded-full hover:bg-indigo-600/20 transition-colors"
          >
            ALEATÓRIO
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setState(prev => ({ 
                ...prev, 
                theme: { id: 'all', name: 'Todos os Temas', category: 'Misto', words: [], updated_at: null } 
              }))}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all text-left space-y-1",
                state.theme?.id === 'all' 
                  ? "bg-indigo-600/20 border-indigo-600" 
                  : "bg-zinc-900 border-zinc-800"
              )}
            >
              <div className="font-bold truncate">Todos os Temas</div>
              <div className="text-xs text-zinc-500">Misto</div>
            </button>
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setState(prev => ({ ...prev, theme }))}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all text-left space-y-1",
                  state.theme?.id === theme.id 
                    ? "bg-indigo-600/20 border-indigo-600" 
                    : "bg-zinc-900 border-zinc-800"
                )}
              >
                <div className="font-bold truncate">{theme.name}</div>
                <div className="text-xs text-zinc-500">{theme.category}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <PrimaryButton 
        onClick={handleStart}
        className="sticky bottom-6"
      >
        {state.theme ? 'COMEÇAR JOGO' : 'JOGAR COM TEMA ALEATÓRIO'}
      </PrimaryButton>
    </div>
  );
};

const GamePlay = () => {
  const navigate = useNavigate();
  const { state, setState, resetGame } = useGame();
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  React.useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  if (!state.gameStarted) {
    return <div className="flex flex-col items-center justify-center h-full gap-4">
      <AlertCircle size={48} className="text-zinc-500" />
      <p>Nenhum jogo em andamento</p>
      <PrimaryButton onClick={() => navigate('/setup')}>Novo Jogo</PrimaryButton>
    </div>;
  }

  const isRevealing = state.currentPlayerIndex < state.roles.length;
  const currentRole = state.roles[state.currentPlayerIndex];

  const playSound = (type: 'reveal' | 'click') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type === 'reveal' ? 'sine' : 'square';
    osc.frequency.setValueAtTime(type === 'reveal' ? 440 : 220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(type === 'reveal' ? 880 : 110, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const handleNext = () => {
    if (state.isRevealed) {
      playSound('click');
      setState(prev => ({
        ...prev,
        isRevealed: false,
        currentPlayerIndex: prev.currentPlayerIndex + 1
      }));
    } else {
      playSound('reveal');
      setState(prev => ({ ...prev, isRevealed: true }));
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isRevealing ? `Jogador ${state.currentPlayerIndex + 1}` : 'Discussão'}
        </h2>
        {!isRevealing && (
          <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full">
            <Timer size={18} className={isTimerActive ? "text-indigo-500 animate-pulse" : ""} />
            <span className="font-mono font-bold">{formatTime(timer)}</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isRevealing ? (
          <motion.div
            key={`reveal-${state.currentPlayerIndex}-${state.isRevealed}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-8"
          >
            <div className="text-center space-y-2">
              <p className="text-zinc-400">
                {state.isRevealed ? 'Sua palavra é:' : 'Passe o celular para o'}
              </p>
              <h3 className="text-3xl font-black">
                {state.isRevealed ? '' : `Jogador ${state.currentPlayerIndex + 1}`}
              </h3>
            </div>

            <div 
              className={cn(
                "w-full aspect-square max-w-xs rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-500",
                state.isRevealed ? "bg-indigo-600 shadow-2xl shadow-indigo-500/40" : "bg-zinc-800"
              )}
            >
              {state.isRevealed ? (
                <>
                  <Eye size={64} />
                  <div className="text-4xl font-black uppercase tracking-widest text-center px-4">
                    {currentRole === 'impostor' ? 'VOCÊ É O IMPOSTOR!' : state.word}
                  </div>
                  {currentRole === 'impostor' && state.hint && (
                    <div className="bg-white/10 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                      Dica: {state.hint}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <EyeOff size={64} className="text-zinc-600" />
                  <p className="text-zinc-500 font-bold">TOQUE PARA REVELAR</p>
                </>
              )}
            </div>

            <PrimaryButton onClick={handleNext} className="max-w-xs">
              {state.isRevealed ? 'ENTENDI' : 'REVELAR'}
            </PrimaryButton>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col gap-6"
          >
            <Card className="flex-1 flex flex-col items-center justify-center text-center gap-6">
              <div className="p-6 bg-indigo-600/20 rounded-full">
                <Users size={64} className="text-indigo-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Hora de Debater!</h3>
                <p className="text-zinc-400">
                  Façam perguntas uns aos outros para descobrir quem é o impostor.
                  O impostor deve tentar se misturar!
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-zinc-800 p-4 rounded-2xl">
                  <div className="text-xs text-zinc-500 uppercase">Tema</div>
                  <div className="font-bold">{state.theme?.name}</div>
                </div>
                <div className="bg-zinc-800 p-4 rounded-2xl">
                  <div className="text-xs text-zinc-500 uppercase">Impostores</div>
                  <div className="font-bold">{state.impostors}</div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => setIsTimerActive(!isTimerActive)}>
                {isTimerActive ? 'PAUSAR' : 'INICIAR TIMER'}
              </Button>
              <Button onClick={() => {
                confetti();
                resetGame();
                navigate('/');
              }}>
                FINALIZAR
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ThemeManager = () => {
  const navigate = useNavigate();
  const { themes, loading, addCustomTheme, seedInitialData } = useThemes();
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newTheme, setNewTheme] = useState({ name: '', category: '', words: '' });

  const handleSync = async () => {
    setIsSyncing(true);
    await seedInitialData();
    setIsSyncing(false);
    toast.success('Temas sincronizados!');
  };

  const handleAdd = async () => {
    const wordList = newTheme.words.split(',').map(w => w.trim()).filter(w => w.length > 0);
    if (wordList.length < 5) {
      toast.error('Adicione pelo menos 5 palavras');
      return;
    }
    await addCustomTheme({
      name: newTheme.name,
      category: newTheme.category,
      words: wordList
    });
    setIsAdding(false);
    setNewTheme({ name: '', category: '', words: '' });
    toast.success('Tema adicionado com sucesso!');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 bg-zinc-800 rounded-full">
            <ChevronLeft />
          </button>
          <h2 className="text-2xl font-bold">Temas</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="p-3 bg-zinc-800 rounded-2xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
            title="Sincronizar temas padrão"
          >
            <RotateCcw className={isSyncing ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20"
          >
            <Plus />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="space-y-4 mb-6">
              <input 
                placeholder="Nome do Tema" 
                className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white placeholder:text-zinc-500"
                value={newTheme.name}
                onChange={e => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
              />
              <input 
                placeholder="Categoria (ex: Diversão)" 
                className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white placeholder:text-zinc-500"
                value={newTheme.category}
                onChange={e => setNewTheme(prev => ({ ...prev, category: e.target.value }))}
              />
              <textarea 
                placeholder="Palavras (separadas por vírgula)" 
                className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white placeholder:text-zinc-500 h-32"
                value={newTheme.words}
                onChange={e => setNewTheme(prev => ({ ...prev, words: e.target.value }))}
              />
              <div className="flex gap-3">
                <Button onClick={() => setIsAdding(false)} className="bg-transparent border border-zinc-800">Cancelar</Button>
                <PrimaryButton onClick={handleAdd}>Salvar</PrimaryButton>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {themes.map(theme => (
          <Card key={theme.id} className="flex items-center justify-between p-5">
            <div>
              <div className="font-bold text-lg">{theme.name}</div>
              <div className="text-sm text-zinc-500">{theme.category} • {theme.words?.length || 0} palavras</div>
            </div>
            {theme.is_custom && <div className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Custom</div>}
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<GameState>({
    players: 4,
    impostors: 1,
    theme: null,
    word: '',
    hint: '',
    roles: [],
    currentPlayerIndex: 0,
    isRevealed: false,
    gameStarted: false,
    gameOver: false,
  });

  const resetGame = () => setState(prev => ({
    ...prev,
    gameStarted: false,
    currentPlayerIndex: 0,
    isRevealed: false,
    roles: [],
    word: '',
    hint: ''
  }));

  return (
    <GameContext.Provider value={{ state, setState, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <GameProvider>
        <Router>
          <div className="max-w-md mx-auto px-6 py-8 min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/setup" element={<GameSetup />} />
                <Route path="/play" element={<GamePlay />} />
                <Route path="/themes" element={<ThemeManager />} />
              </Routes>
            </main>
            
            <footer className="mt-auto pt-8 flex justify-center gap-8 text-zinc-600 border-t border-zinc-900">
              <button className="hover:text-white transition-colors"><HomeIcon size={20} /></button>
              <button className="hover:text-white transition-colors"><Trophy size={20} /></button>
              <button className="hover:text-white transition-colors"><Settings size={20} /></button>
            </footer>
          </div>
        </Router>
      </GameProvider>
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
}
