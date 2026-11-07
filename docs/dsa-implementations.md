# MysteryStay — DSA Implementations & Interview Guide

> **Project**: MysteryStay  
> **Tagline**: Discover Hidden Stays. Unlock Better Deals.  
> **Founder & Developer**: Prakash Chakali  
> **Documentation Standard**: Formal algorithm specifications, mathematical proofs, complexity derivations, and interview defense questions.

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

### Solution: Inverted Index with Set Intersection
We maintain three in-memory inverted index maps:
1. `Map<String, Set<Long>> cityIndex` (Maps city $\to$ deal IDs)
2. `Map<Integer, Set<Long>> starRatingIndex` (Maps star rating $\to$ deal IDs)
3. `Map<String, Set<Long>> amenityClueIndex` (Maps luxury clue tag $\to$ deal IDs)

When querying across multiple attributes, we compute the set intersection ordered from the smallest set to the largest:
```java
Set<Long> candidateIds = new HashSet<>(smallestSet);
for (Set<Long> otherSet : criteriaSets) {
    candidateIds.retainAll(otherSet);
    if (candidateIds.isEmpty()) break;
}
```
- **Time Complexity**: $O(\min(|S_1|, |S_2|, \dots, |S_m|))$
- **Space Complexity**: $O(T)$ where $T$ is the total count of term-to-deal postings.

---

## 3. Consecutive Stay Calendar Price Optimizer (Sliding Window)

### Problem Statement
A traveler wants to book a consecutive stay of $L$ nights within an eligible date window of $D$ days. Room prices fluctuate daily. The optimizer must find the consecutive stay window with the minimum total cost.

### Algorithmic Solutions

#### A. Brute Force
For each possible start index $i \in [0, D - L]$, sum $L$ days:
- **Time Complexity**: $O((D - L + 1) \times L) \approx O(D \cdot L)$
- **Auxiliary Space Complexity**: $O(1)$

#### B. Optimal Solution: Sliding Window
Compute the initial window sum $S_0 = \sum_{j=0}^{L-1} \text{rate}[j]$ in $O(L)$.
Slide the window across the remaining $D - L$ days in $O(1)$ per step:
$$S_i = S_{i-1} - \text{rate}[i - 1] + \text{rate}[i + L - 1]$$
- **Time Complexity**: $O(D)$ linear
- **Auxiliary Space Complexity**: $O(1)$ constant

---

## 4. 0/1 Budget Knapsack Deal Optimizer (Dynamic Programming)

### Problem Statement
A traveler has a hard total budget constraint of $W$ dollars (e.g., \$600.00) and wishes to select the optimal portfolio of multi-night mystery packages that maximizes total monetary discount savings without exceeding $W$.

### Recurrence Relation
Let $\text{dp}[i][w]$ be the maximum discount savings achievable considering the first $i$ mystery packages with a budget capacity $w$:
$$\text{dp}[i][w] = \begin{cases} 
\text{dp}[i-1][w] & \text{if } \text{price}[i] > w \\
\max\Big(\text{dp}[i-1][w],\; \text{dp}[i-1][w - \text{price}[i]] + \text{savings}[i]\Big) & \text{otherwise}
\end{cases}$$

- **Time Complexity**: $O(N \cdot W)$ pseudo-polynomial
- **Space Complexity**: $O(W)$ using 1D rolling array optimization
- **Interview Defense**: Avoids exponential $O(2^N)$ brute-force subset generation, mathematically guaranteeing global optimality.

---

## 5. Technical Interview Defense Guide

### Why use an in-memory Bounded Min-Heap instead of a database `ORDER BY ... LIMIT K`?
1. **Dynamic Real-Time Weighting**: Perceived value scores depend on client-side session context (e.g., guest budget, time of booking, personalization sliders). Materializing or indexing these composite scores inside a relational DB is impractical because weights shift on every request.
2. **CPU and Index Isolation**: Database servers should focus on ACID transactions and relational persistence. Offloading ranking to the backend application server isolates CPU-intensive computations and allows horizontal scaling.

### Why not use `List.sort()` or Java Streams `.sorted().limit(K)`?
- `List.sort()` uses Dual-Pivot Quicksort or TimSort requiring $O(N \log N)$ operations and sorting elements that will never be shown to the user.
- A Bounded Min-Heap of size $K$ processes each item in at most $O(\log K)$ operations, maintaining only $K$ elements in memory. When $N = 10,000$ and $K = 10$, this reduces CPU branching and memory thrashing.
