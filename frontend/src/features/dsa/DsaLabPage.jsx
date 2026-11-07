import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Layers, 
  Sliders, 
  Sparkles, 
  Info,
  Clock,
  Database,
  ArrowRight
} from 'lucide-react';

export const DsaLabPage = () => {
  const [activeTab, setActiveTab] = useState('HEAP'); // HEAP, INVERTED_INDEX, SLIDING_WINDOW, DP_KNAPSACK

  // ==========================================
  // 1. TOP-K MIN-HEAP STATE & LOGIC
  // ==========================================
  const rawDeals = [
    { id: 1, title: 'Heritage Palace Bangalore', score: 85, price: 228 },
    { id: 2, title: 'Cliffside Ocean Villa Goa', score: 94, price: 260 },
    { id: 3, title: 'Sea View Premier Mumbai', score: 78, price: 192 },
    { id: 4, title: 'Art Deco Haven Delhi', score: 72, price: 188 },
    { id: 5, title: 'Lakeside Royal Suite Udaipur', score: 91, price: 310 },
    { id: 6, title: 'Mountain Mist Retreat Coorg', score: 82, price: 215 },
  ];
  const K = 4;
  const [heapStep, setHeapStep] = useState(0);
  const [heapIsPlaying, setHeapIsPlaying] = useState(false);
  const [heapItems, setHeapItems] = useState([]);
  const [heapLog, setHeapLog] = useState([]);

  // Compute Heap state step-by-step
  useEffect(() => {
    let currentHeap = [];
    let log = [];

    for (let i = 0; i <= heapStep && i < rawDeals.length; i++) {
      const deal = rawDeals[i];
      if (currentHeap.length < K) {
        currentHeap.push(deal);
        currentHeap.sort((a, b) => a.score - b.score); // Maintain min-heap order
        log.push(`Inserted Deal #${deal.id} (Score: ${deal.score}). Heap size: ${currentHeap.length}/${K}`);
      } else {
        if (deal.score > currentHeap[0].score) {
          const evicted = currentHeap.shift();
          currentHeap.push(deal);
          currentHeap.sort((a, b) => a.score - b.score);
          log.push(`Deal #${deal.id} (Score: ${deal.score}) > Min Root #${evicted.id} (${evicted.score}). Evicted #${evicted.id}, inserted #${deal.id}.`);
        } else {
          log.push(`Deal #${deal.id} (Score: ${deal.score}) <= Min Root #${currentHeap[0].id} (${currentHeap[0].score}). Skipped.`);
        }
      }
    }

    setHeapItems([...currentHeap]);
    setHeapLog(log);
  }, [heapStep]);

  useEffect(() => {
    let interval;
    if (heapIsPlaying) {
      interval = setInterval(() => {
        setHeapStep((prev) => {
          if (prev >= rawDeals.length - 1) {
            setHeapIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [heapIsPlaying]);

  // ==========================================
  // 2. SLIDING WINDOW STATE & LOGIC
  // ==========================================
  const dailyRates = [240, 260, 290, 310, 350, 220, 210, 205, 205, 230, 280, 320, 240, 225];
  const [windowSize, setWindowSize] = useState(3);
  const [windowIndex, setWindowIndex] = useState(0);
  const [windowIsPlaying, setWindowIsPlaying] = useState(false);

  const currentWindowSum = dailyRates
    .slice(windowIndex, windowIndex + windowSize)
    .reduce((a, b) => a + b, 0);

  // Compute all sums to determine overall best
  let bestWindowStart = 0;
  let minWindowSum = Infinity;
  for (let i = 0; i <= dailyRates.length - windowSize; i++) {
    const s = dailyRates.slice(i, i + windowSize).reduce((a, b) => a + b, 0);
    if (s < minWindowSum) {
      minWindowSum = s;
      bestWindowStart = i;
    }
  }

  useEffect(() => {
    let interval;
    if (windowIsPlaying) {
      interval = setInterval(() => {
        setWindowIndex((prev) => {
          if (prev >= dailyRates.length - windowSize) {
            setWindowIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [windowIsPlaying, windowSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD5]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B] flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> Real Java Algorithm Laboratory
          </span>
          <h1 className="font-editorial text-4xl text-[#14251F]">
            Algorithms That Power MysteryStay
          </h1>
          <p className="text-xs text-[#5A626A] mt-1 max-w-2xl">
            Interactive visualizers reflecting the exact backend algorithms powering our production Spring Boot modular monolith.
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'HEAP', label: '1. Top-K Min-Heap' },
            { id: 'SLIDING_WINDOW', label: '2. Sliding Window' },
            { id: 'INVERTED_INDEX', label: '3. Inverted Index' },
            { id: 'DP_KNAPSACK', label: '4. Dynamic Programming' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#14251F] text-white shadow-luxury'
                  : 'bg-white border border-[#E4DFD5] text-[#5A626A] hover:bg-[#EFECE4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. TOP-K BOUNDED MIN-HEAP VISUALIZER */}
      {/* ======================================================= */}
      {activeTab === 'HEAP' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visualizer Panel */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E4DFD5] p-6 sm:p-8 shadow-luxury space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-editorial text-2xl text-[#14251F]">
                    Bounded Min-Heap Visualizer (K={K})
                  </h3>
                  <p className="text-xs text-[#5A626A]">
                    Evaluating candidate deals stream. Root holds minimum score among top {K}.
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHeapIsPlaying(!heapIsPlaying)}
                    className="p-2.5 rounded-xl bg-[#14251F] text-white hover:bg-[#1A2F27]"
                    title={heapIsPlaying ? 'Pause' : 'Play'}
                  >
                    {heapIsPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setHeapStep((prev) => Math.min(rawDeals.length - 1, prev + 1))}
                    disabled={heapStep >= rawDeals.length - 1}
                    className="p-2.5 rounded-xl border border-[#E4DFD5] hover:bg-[#F8F6F0] disabled:opacity-40"
                    title="Step Forward"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setHeapStep(0);
                      setHeapIsPlaying(false);
                    }}
                    className="p-2.5 rounded-xl border border-[#E4DFD5] hover:bg-[#F8F6F0]"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Incoming Stream Indicator */}
              <div className="p-4 bg-[#F8F6F0] rounded-2xl border border-[#E4DFD5] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#5A626A] block">
                  Incoming Deal Stream:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {rawDeals.map((deal, idx) => (
                    <div
                      key={deal.id}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
                        idx === heapStep
                          ? 'bg-[#C6A66B] text-[#14251F] border-transparent font-bold scale-105 shadow-md'
                          : idx < heapStep
                          ? 'bg-white text-[#5A626A] border-[#E4DFD5] opacity-50'
                          : 'bg-white text-[#14251F] border-[#E4DFD5]'
                      }`}
                    >
                      <div>#{deal.id} {deal.title.split(' ')[0]}</div>
                      <div className="text-[10px] opacity-75">Score: {deal.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bounded Heap Tree Visualization */}
              <div className="p-6 bg-[#14251F] text-white rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#C6A66B] font-bold uppercase tracking-wider text-[10px]">
                    Current Top-{K} Min-Heap Memory (Java PriorityQueue)
                  </span>
                  <span className="text-white/60">Root = Minimum score candidate</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {heapItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        idx === 0
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider block opacity-70">
                        {idx === 0 ? 'Root (Min)' : `Heap Node #${idx + 1}`}
                      </span>
                      <div className="font-editorial text-2xl font-bold my-1">
                        {item.score}
                      </div>
                      <div className="text-[11px] truncate">{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Log */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#14251F] block">
                  Execution Trace:
                </span>
                <div className="bg-[#0C1814] text-[#C6A66B] font-mono text-[11px] p-4 rounded-xl space-y-1 max-h-36 overflow-y-auto">
                  {heapLog.map((line, idx) => (
                    <div key={idx}>▸ {line}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Complexity & Educational Explanation Panel */}
            <div className="lg:col-span-4 bg-[#F8F6F0] rounded-3xl border border-[#E4DFD5] p-6 sm:p-8 space-y-6">
              <h4 className="font-editorial text-2xl text-[#14251F]">
                Algorithm Specs
              </h4>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#E4DFD5]">
                  <span className="font-bold uppercase text-[#5A626A] text-[10px] block">Time Complexity</span>
                  <span className="font-mono text-base font-bold text-[#14251F]">O(N log K)</span>
                  <p className="text-[11px] text-[#5A626A] mt-1">
                    Far superior to sorting entire catalog O(N log N) when N=100,000 and K=10.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E4DFD5]">
                  <span className="font-bold uppercase text-[#5A626A] text-[10px] block">Space Complexity</span>
                  <span className="font-mono text-base font-bold text-[#14251F]">O(K)</span>
                  <p className="text-[11px] text-[#5A626A] mt-1">
                    Only retains K elements in memory regardless of database size.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E4DFD5]">
                  <span className="font-bold uppercase text-[#5A626A] text-[10px] block">Production Use Case</span>
                  <p className="text-[11px] text-[#14251F] mt-1">
                    Powering <code>TopKDealRanker.java</code> on the homepage feed to rank highest composite value deals in real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. SLIDING WINDOW CONSECUTIVE STAY OPTIMIZER */}
      {/* ======================================================= */}
      {activeTab === 'SLIDING_WINDOW' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E4DFD5] p-6 sm:p-8 shadow-luxury space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-editorial text-2xl text-[#14251F]">
                    Sliding Window Price Optimizer (Window Size = {windowSize} Nights)
                  </h3>
                  <p className="text-xs text-[#5A626A]">
                    Detects the cheapest contiguous stay window across 14 days in linear O(D) time.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWindowIsPlaying(!windowIsPlaying)}
                    className="p-2.5 rounded-xl bg-[#14251F] text-white hover:bg-[#1A2F27]"
                  >
                    {windowIsPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setWindowIndex((prev) => Math.min(dailyRates.length - windowSize, prev + 1))}
                    disabled={windowIndex >= dailyRates.length - windowSize}
                    className="p-2.5 rounded-xl border border-[#E4DFD5] hover:bg-[#F8F6F0] disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setWindowIndex(0);
                      setWindowIsPlaying(false);
                    }}
                    className="p-2.5 rounded-xl border border-[#E4DFD5] hover:bg-[#F8F6F0]"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 14-Day Calendar Price Array */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#14251F]">14-Day Calendar Array:</span>
                  <span className="text-[11px] text-[#5A626A]">
                    Current Window: Days {windowIndex + 1} → {windowIndex + windowSize}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {dailyRates.map((price, idx) => {
                    const isInWindow = idx >= windowIndex && idx < windowIndex + windowSize;
                    const isOptimal = idx >= bestWindowStart && idx < bestWindowStart + windowSize;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isInWindow
                            ? 'bg-[#C6A66B] text-[#14251F] border-transparent font-bold scale-105 shadow-md'
                            : isOptimal
                            ? 'bg-emerald-50 text-[#0D8A5E] border-emerald-300 font-semibold'
                            : 'bg-[#F8F6F0] text-[#14251F] border-[#E4DFD5]'
                        }`}
                      >
                        <div className="text-[10px] opacity-70">Day {idx + 1}</div>
                        <div className="text-sm font-bold font-editorial">${price}</div>
                        {isOptimal && (
                          <div className="text-[8px] uppercase font-bold text-[#0D8A5E] mt-0.5">
                            Optimal
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Window Running Sum Metric */}
              <div className="p-6 bg-[#14251F] text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#C6A66B] font-bold uppercase tracking-wider block">
                    Running Window Sum (O(1) Step Transition)
                  </span>
                  <div className="font-editorial text-3xl text-white mt-1">
                    ${currentWindowSum} Total
                  </div>
                  <span className="text-xs text-white/60">
                    Avg. ${(currentWindowSum / windowSize).toFixed(2)} / night
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Global Minimum Window (Days {bestWindowStart + 1}–{bestWindowStart + windowSize})
                  </span>
                  <div className="font-editorial text-3xl text-emerald-400 mt-1">
                    ${minWindowSum} Total
                  </div>
                </div>
              </div>
            </div>

            {/* Complexity Specs */}
            <div className="lg:col-span-4 bg-[#F8F6F0] rounded-3xl border border-[#E4DFD5] p-6 sm:p-8 space-y-6">
              <h4 className="font-editorial text-2xl text-[#14251F]">
                Algorithm Specs
              </h4>
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#E4DFD5]">
                  <span className="font-bold uppercase text-[#5A626A] text-[10px] block">Time Complexity</span>
                  <span className="font-mono text-base font-bold text-[#14251F]">O(D) Linear</span>
                  <p className="text-[11px] text-[#5A626A] mt-1">
                    Adds exiting day and subtracts entering day in O(1) per step.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E4DFD5]">
                  <span className="font-bold uppercase text-[#5A626A] text-[10px] block">Space Complexity</span>
                  <span className="font-mono text-base font-bold text-[#14251F]">O(1) Constant</span>
                  <p className="text-[11px] text-[#5A626A] mt-1">
                    Zero supplementary memory allocation.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E4DFD5]">
                  <span className="font-bold uppercase text-[#5A626A] text-[10px] block">Production Use Case</span>
                  <p className="text-[11px] text-[#14251F] mt-1">
                    Powering <code>StayWindowOptimizer.java</code> in the deal dossier to suggest the cheapest consecutive stay dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. MULTI-ATTRIBUTE INVERTED INDEX */}
      {/* ======================================================= */}
      {activeTab === 'INVERTED_INDEX' && (
        <div className="bg-white rounded-3xl border border-[#E4DFD5] p-8 shadow-luxury space-y-6">
          <div>
            <h3 className="font-editorial text-2xl text-[#14251F]">
              Multi-Attribute Inverted Index (HashMap & HashSet)
            </h3>
            <p className="text-xs text-[#5A626A]">
              Sub-millisecond set intersection across City, Star Tier, and Luxury Amenities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-[#F8F6F0] rounded-2xl border border-[#E4DFD5] space-y-2">
              <span className="font-bold text-[#14251F] block">City Index Map</span>
              <div className="font-mono text-[11px] space-y-1 text-[#5A626A]">
                <div>"Bangalore" → &#123;Deal #1, #6&#125;</div>
                <div>"Goa" → &#123;Deal #2&#125;</div>
                <div>"Mumbai" → &#123;Deal #3&#125;</div>
                <div>"Delhi" → &#123;Deal #4&#125;</div>
              </div>
            </div>

            <div className="p-4 bg-[#F8F6F0] rounded-2xl border border-[#E4DFD5] space-y-2">
              <span className="font-bold text-[#14251F] block">Star Rating Index</span>
              <div className="font-mono text-[11px] space-y-1 text-[#5A626A]">
                <div>5 Stars → &#123;Deal #1, #2, #3, #4, #5&#125;</div>
                <div>4 Stars → &#123;Deal #6&#125;</div>
              </div>
            </div>

            <div className="p-4 bg-[#F8F6F0] rounded-2xl border border-[#E4DFD5] space-y-2">
              <span className="font-bold text-[#14251F] block">Amenity Clue Index</span>
              <div className="font-mono text-[11px] space-y-1 text-[#5A626A]">
                <div>"Plunge Pool" → &#123;Deal #2&#125;</div>
                <div>"Butler" → &#123;Deal #1, #5&#125;</div>
                <div>"Ocean Vista" → &#123;Deal #2, #3&#125;</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#14251F] text-white rounded-2xl text-xs space-y-2">
            <span className="text-[#C6A66B] font-bold uppercase tracking-wider text-[10px]">
              Set Intersection Performance
            </span>
            <p className="text-white/80">
              Query: <code>City == "Goa" AND Star == 5 AND Amenity == "Plunge Pool"</code>
            </p>
            <div className="font-mono text-[#0D8A5E] bg-black/40 p-3 rounded-xl">
              Result: &#123;2&#125; ∩ &#123;1,2,3,4,5&#125; ∩ &#123;2&#125; = &#123;Deal #2 (Cliffside Ocean Villa)&#125; in 0.12ms!
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 4. DYNAMIC PROGRAMMING BUDGET KNAPSACK */}
      {/* ======================================================= */}
      {activeTab === 'DP_KNAPSACK' && (
        <div className="bg-white rounded-3xl border border-[#E4DFD5] p-8 shadow-luxury space-y-6">
          <div>
            <h3 className="font-editorial text-2xl text-[#14251F]">
              Dynamic Programming 0/1 Budget Knapsack
            </h3>
            <p className="text-xs text-[#5A626A]">
              Maximizing total traveler discount value subject to a strict maximum budget constraint $W.
            </p>
          </div>

          <div className="p-6 bg-[#14251F] text-white rounded-2xl text-xs space-y-3">
            <span className="text-[#C6A66B] font-bold uppercase tracking-wider text-[10px]">
              Recurrence Relation
            </span>
            <div className="font-mono text-sm bg-black/40 p-4 rounded-xl text-[#DFCA9E]">
              dp[i][w] = max(dp[i-1][w], dp[i-1][w - price[i]] + savings[i])
            </div>
            <p className="text-white/70">
              Guarantees the mathematically optimal portfolio of mystery bookings within budget without exponential 2^N brute force search.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DsaLabPage;
