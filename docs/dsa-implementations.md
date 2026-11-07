# MysteryStay — DSA Implementations & Interview Guide

This document provides formal architectural and algorithmic documentation for all Data Structures and Algorithms implemented across the MysteryStay platform, in compliance with Section 7 of `AGENTS.md`.

---

## 1. Top-$K$ Mystery Deal Ranker (Bounded Min-Heap / PriorityQueue)

### Problem Statement
When a traveler searches for mystery hotel deals, thousands of matching options may exist across a metropolitan area. The platform must compute a dynamic composite **Value Score** for each deal and return only the top $K$ most valuable deals (e.g., $K = 5$ or $10$) without sorting the entire dataset.

### Dynamic Value Scoring Function
$$\text{ValueScore} = (w_{\text{disc}} \cdot \text{discountPercent}) + (w_{\text{star}} \cdot \text{starRating} \times 10) - \left(w_{\text{price}} \cdot \frac{\text{mysteryPrice}}{\text{maxBudgetBound}} \times 100\right)$$
- $w_{\text{disc}} = 0.50$ (rewards high savings percentage)
- $w_{\text{star}} = 0.30$ (rewards luxury tier)
- $w_{\text{price}} = 0.20$ (penalizes absolute cash outflow normalized against traveler budget)

### Algorithmic Solutions

#### A. Brute Force Solution
Collect all $N$ candidate deals, calculate their scores, sort the entire list using TimSort, and take the first $K$ elements:
```java
deals.stream()
     .map(deal -> score(deal))
     .sorted(Comparator.comparingDouble(ScoredDeal::valueScore).reversed())
     .limit(k)
     .toList();
```
- **Time Complexity**: $O(N \log N)$
- **Auxiliary Space Complexity**: $O(N)$ for sorting buffer

#### B. Optimal Solution: Bounded Min-Heap (`PriorityQueue`)
Maintain a Min-Heap of fixed capacity $K$, ordered ascending by `valueScore`. The candidate with the smallest score in the current top-$K$ selection is at `heap.peek()`.
```java
PriorityQueue<ScoredDeal> minHeap = new PriorityQueue<>(k);
for (MaskedDealResponse deal : deals) {
    ScoredDeal scored = scoreDeal(deal, maxBudget);
    if (minHeap.size() < k) {
        minHeap.offer(scored);
    } else if (scored.valueScore() > minHeap.peek().valueScore()) {
        minHeap.poll(); // Evict the smallest element in O(log K)
        minHeap.offer(scored); // Insert new contender in O(log K)
    }
}
```
- **Time Complexity**: $O(N \log K)$
- **Auxiliary Space Complexity**: $O(K)$

### Mathematical Comparison & Trade-off
For $N = 10,000$ deals and $K = 10$:
- Brute Force / TimSort: $10,000 \times \log_2(10,000) \approx 10,000 \times 13.29 \approx 132,900$ comparisons.
- Bounded Min-Heap: $10,000 \times \log_2(10) \approx 10,000 \times 3.32 \approx 33,200$ comparisons.
- **Speedup**: Over $4\times$ fewer comparisons and $1000\times$ less heap memory allocated ($K=10$ vs $N=10,000$).

### Dry Run
Input deals with scores: $[15.2, 28.4, 9.1, 42.0, 31.5]$, requesting $K = 3$.
1. Item 1 (15.2): Heap size < 3 $\to$ Insert. Heap: `[15.2]`
2. Item 2 (28.4): Heap size < 3 $\to$ Insert. Heap: `[15.2, 28.4]`
3. Item 3 (9.1): Heap size < 3 $\to$ Insert. Heap: `[9.1, 28.4, 15.2]` (peek is 9.1)
4. Item 4 (42.0): $42.0 > 9.1 \to$ Poll 9.1, Insert 42.0. Heap: `[15.2, 28.4, 42.0]` (peek is 15.2)
5. Item 5 (31.5): $31.5 > 15.2 \to$ Poll 15.2, Insert 31.5. Heap: `[28.4, 42.0, 31.5]`
Result extracted & reversed: `[42.0, 31.5, 28.4]`. Correct Top 3!

---

## 2. Multi-Attribute Inverted Index (`HashMap` + `HashSet`)

### Problem Statement
Travelers filter mystery deals by multiple attributes: city, star rating, and luxury mystery clues (e.g., `INFINITY_POOL`, `SPA`, `ROOFTOP_LOUNGE`). Scanning all rows in SQL using repeated `JOIN` and `LIKE` queries incurs heavy I/O and locks.

### Algorithmic Solution
Build an in-memory Inverted Index:
- `cityIndex: Map<String, Set<Long>>` (City $\to$ Set of Deal IDs)
- `starRatingIndex: Map<Integer, Set<Long>>` (Star Rating $\to$ Set of Deal IDs)
- `amenityIndex: Map<String, Set<Long>>` (Clue tag $\to$ Set of Deal IDs)

#### Set Intersection Optimization
When querying multiple criteria ($S_1, S_2, \dots, S_m$):
1. Sort candidate sets by cardinality in ascending order: $|S_1| \le |S_2| \le \dots \le |S_m|$.
2. Start with the smallest set $S_1$ as the base.
3. For each remaining set $S_i$, execute `result.retainAll(S_i)`:
   - If `result` becomes empty at any step, break immediately (**Short-Circuiting**).
- **Time Complexity**: $O(\min(|S_1|, |S_2|, \dots, |S_m|))$
- **Space Complexity**: $O(\text{Total deal-attribute postings})$

---

## 3. Consecutive Stay Price-Trend & Best Window Detector (Sliding Window)

### Problem Statement
Given a deal valid over a date range of $D$ days with variable daily rates (base rate on weekdays, 15% surcharge on Friday and Saturday nights), find the optimal check-in date for an $L$-night consecutive stay ($1 \le L \le D$) that minimizes total cost.

### Algorithmic Solutions

#### A. Brute Force Solution
For every possible starting day index $i \in [0, D - L]$, sum $L$ days:
$$\sum_{j=i}^{i+L-1} \text{rate}[j]$$
- **Time Complexity**: $O((D - L + 1) \cdot L) \approx O(D \cdot L)$
- **Auxiliary Space Complexity**: $O(1)$

#### B. Optimal Solution: Sliding Window
Compute the initial window sum $S_0 = \sum_{j=0}^{L-1} \text{rate}[j]$ in $O(L)$.
Slide the window across the remaining $D - L$ days in $O(1)$ per step:
$$S_i = S_{i-1} - \text{rate}[i - 1] + \text{rate}[i + L - 1]$$
- **Time Complexity**: $O(D)$
- **Auxiliary Space Complexity**: $O(1)$

### Dry Run
Given daily rates $[200, 210, 110, 105, 115, 250]$, $L = 3$:
1. Initial window $[0 \dots 2]$: $200 + 210 + 110 = 520$. Min = 520, Start = 0.
2. Step 1 (Day 3): $520 - 200 + 105 = 425$. $425 < 520 \to$ Min = 425, Start = 1.
3. Step 2 (Day 4): $425 - 210 + 115 = 330$. $330 < 425 \to$ Min = 330, Start = 2 (Dates: Days 2, 3, 4).
4. Step 3 (Day 5): $330 - 110 + 250 = 470$. $470 > 330 \to$ Ignore.
Best stay window: Index 2, Total Cost = \$330.00.

---

## 4. Technical Interview Defense Guide

### Why use an in-memory Bounded Min-Heap instead of a database `ORDER BY ... LIMIT K`?
1. **Dynamic Real-Time Weighting**: Perceived value scores depend on client-side session context (e.g., guest budget, time of booking, personalization sliders). Materializing or indexing these composite scores inside a relational DB is impractical because weights shift on every request.
2. **CPU and Index Isolation**: Database servers should focus on ACID transactions and relational persistence. Offloading ranking to the backend application server isolates CPU-intensive computations and allows horizontal scaling.

### Why not use `List.sort()` or Java Streams `.sorted().limit(K)`?
- `List.sort()` uses Dual-Pivot Quicksort or TimSort requiring $O(N \log N)$ operations and sorting elements that will never be shown to the user.
- A Bounded Min-Heap of size $K$ processes each item in at most $O(\log K)$ operations, maintaining only $K$ elements in memory. When $N = 10,000$ and $K = 10$, this reduces CPU branching and memory thrashing.
