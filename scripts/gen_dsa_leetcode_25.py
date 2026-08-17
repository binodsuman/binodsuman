#!/usr/bin/env python3
"""Generate js/dsa-leetcode-25-data.js from problem dicts."""
import json
from pathlib import Path

P = []


def add(**kwargs):
    P.append(kwargs)


add(
    id=1,
    lc=1,
    slug="two-sum",
    title="Two Sum",
    difficulty="Easy",
    pattern="Hash Map",
    tags=["Array", "Hash Map"],
    question="Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.",
    example="Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\n\nInput: nums = [3, 2, 4], target = 6\nOutput: [1, 2]",
    thinking="After reading this, I do not sort — sorting would scramble indices. Brute force is two nested loops O(n²). The interview upgrade is one pass: for each number x, ask 'have I already seen target − x?' A hash map of value → index answers that in O(1). I clarify: exactly one pair, duplicates allowed as values, same index not allowed.",
    explain="Think of a checkout: you hold item 2, and you need a 7 to hit 9. Instead of scanning the whole cart every time, you keep a sticky note of what you already saw. When 7 appears, the note already has 2 at index 0 — done. That sticky note is a hash map.",
    patternFlow="nums:  2   7   11  15     target = 9\nidx:   0   1   2   3\n\nscan i=0, x=2  need=7  map={}        store 2→0\nscan i=1, x=7  need=2  map has 2!    return [0, 1]\n\ndata flow: x ──► need = target-x ──► map.get(need)? ──yes──► [j, i]\n                                    └──no──► map.put(x, i)",
    important="Return indices, not values. Cannot reuse the same index. Do not sort if you need original indices. Hash map stores the first occurrence; one pass is enough because the pair is unique.",
    snippetJava="""int need = target - nums[i];
if (map.containsKey(need)) {
    return new int[] { map.get(need), i };
}
map.put(nums[i], i);""",
    snippetPython="""need = target - x
if need in seen:
    return [seen[need], i]
seen[x] = i""",
    java="""class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (map.containsKey(need)) {
                return new int[] { map.get(need), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}""",
    python="""class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, x in enumerate(nums):
            need = target - x
            if need in seen:
                return [seen[need], i]
            seen[x] = i
        return []""",
    complexity="Time O(n), Space O(n)",
    followUp="Follow-up: if the array is sorted, two pointers from both ends works in O(n) time and O(1) extra space — but then you typically return values, or you must track original indices separately.",
)

add(
    id=2,
    lc=121,
    slug="best-time-to-buy-and-sell-stock",
    title="Best Time to Buy and Sell Stock",
    difficulty="Easy",
    pattern="One Pass / Greedy",
    tags=["Array", "Greedy"],
    question="You are given an array prices where prices[i] is the price of a given stock on day i. You want to maximize profit by choosing a single day to buy and a different day in the future to sell. Return the maximum profit. If you cannot achieve any profit, return 0.",
    example="Input: prices = [7, 1, 5, 3, 6, 4]\nOutput: 5\nBuy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 5.\n\nInput: prices = [7, 6, 4, 3, 1]\nOutput: 0  (prices only fall)",
    thinking="One buy, one sell, sell after buy. Nested loops comparing every pair is O(n²). The engineer thought: keep the cheapest price seen so far; each day try selling today. Profit = today − minSoFar. Track the max of those profits. This is the same idea as Kadane on daily deltas.",
    explain="Walk the price chart left to right. Always remember the lowest valley you have seen. Each new day, ask: if I sold today after buying at that valley, is this my best profit? If the price drops below the valley, that becomes the new buy day.",
    patternFlow="prices: 7  1  5  3  6  4\nmin:    7  1  1  1  1  1\nprofit: 0  0  4  2  5  3   → answer 5\n\nminSoFar ──► today ──► profit = today - minSoFar ──► maxProfit\n                └── if today < minSoFar, update valley",
    important="You cannot sell before you buy. Only one transaction. Falling market → 0, not negative. Track min price and max profit in one pass.",
    snippetJava="""minPrice = Math.min(minPrice, p);
maxProfit = Math.max(maxProfit, p - minPrice);""",
    snippetPython="""min_price = min(min_price, p)
max_profit = max(max_profit, p - min_price)""",
    java="""class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int p : prices) {
            minPrice = Math.min(minPrice, p);
            maxProfit = Math.max(maxProfit, p - minPrice);
        }
        return maxProfit;
    }
}""",
    python="""class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for p in prices:
            min_price = min(min_price, p)
            max_profit = max(max_profit, p - min_price)
        return max_profit""",
    complexity="Time O(n), Space O(1)",
    followUp="Stock II allows unlimited transactions (sum every uphill). Stock III/IV add DP with at most k transactions.",
)

add(
    id=3,
    lc=217,
    slug="contains-duplicate",
    title="Contains Duplicate",
    difficulty="Easy",
    pattern="Hash Set",
    tags=["Array", "Hash Set"],
    question="Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    example="Input: nums = [1, 2, 3, 1]\nOutput: true\n\nInput: nums = [1, 2, 3, 4]\nOutput: false",
    thinking="Sorting then checking neighbors is O(n log n). The hash-set path is O(n): insert while scanning; if insert fails (already present), we found a duplicate. Interviewers also accept comparing set size with array length.",
    explain="Like checking IDs at a gate. Each number shows its badge. If someone already used that badge, you stop and say duplicate. The set is the list of badges already seen.",
    patternFlow="scan x in nums\n  if x in set → true (duplicate)\n  else add x to set\nend → false",
    important="Empty or single-element arrays are false. Hash set uses extra memory; sorting uses less extra memory but is slower.",
    snippetJava="""if (!set.add(x)) return true;""",
    snippetPython="""if x in seen:
    return True
seen.add(x)""",
    java="""class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) {
            if (!set.add(x)) return true;
        }
        return false;
    }
}""",
    python="""class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()
        for x in nums:
            if x in seen:
                return True
            seen.add(x)
        return False""",
    complexity="Time O(n), Space O(n)",
    followUp="Contains Duplicate II: same value within distance k — use a sliding window set or map of last index.",
)

add(
    id=4,
    lc=238,
    slug="product-of-array-except-self",
    title="Product of Array Except Self",
    difficulty="Medium",
    pattern="Prefix / Suffix",
    tags=["Array", "Prefix"],
    question="Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operator.",
    example="Input: nums = [1, 2, 3, 4]\nOutput: [24, 12, 8, 6]\nBecause: 2*3*4, 1*3*4, 1*2*4, 1*2*3",
    thinking="Division is banned (and zeros would break it). answer[i] = product of everything left of i × product of everything right of i. First pass fills left products into the output array. Second pass multiplies running right product from the end. That meets O(n) time and O(1) extra space (output does not count).",
    explain="For the number at index i, ignore it. Multiply the pile on its left with the pile on its right. You can precompute those piles with two running products instead of recomputing for every i.",
    patternFlow="nums:     1   2   3   4\nleft:     1   1   2   6     (prefix product, 1 before first)\nright:   24  12   4   1     (suffix product, 1 after last)\nanswer:  24  12   8   6     left[i] * right[i]",
    important="No division. Zeros: one zero → only that index is non-zero; two zeros → all zeros. Output extra space is allowed. Left pass then right pass in-place on answer[].",
    snippetJava="""answer[i] = left;
left *= nums[i];
// later from the right:
answer[i] *= right;
right *= nums[i];""",
    snippetPython="""answer[i] = left
left *= nums[i]
# then from the right
answer[i] *= right
right *= nums[i]""",
    java="""class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        int left = 1;
        for (int i = 0; i < n; i++) {
            answer[i] = left;
            left *= nums[i];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= right;
            right *= nums[i];
        }
        return answer;
    }
}""",
    python="""class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = [1] * n
        left = 1
        for i in range(n):
            answer[i] = left
            left *= nums[i]
        right = 1
        for i in range(n - 1, -1, -1):
            answer[i] *= right
            right *= nums[i]
        return answer""",
    complexity="Time O(n), Space O(1) extra (output excluded)",
    followUp="If division were allowed, watch for zeros. Follow-up often asks to do it without a second array — the two-pass in-place trick.",
)

add(
    id=5,
    lc=53,
    slug="maximum-subarray",
    title="Maximum Subarray",
    difficulty="Medium",
    pattern="Kadane (DP)",
    tags=["Array", "DP"],
    question="Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements.",
    example="Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nThe subarray [4, -1, 2, 1] has the largest sum 6.",
    thinking="Contiguous is the keyword — not subsequence. Divide and conquer is O(n log n). Kadane: at each index, decide whether to extend the current run or start a new run at nums[i]. current = max(nums[i], current + nums[i]). Track the global max. All-negative arrays: the answer is the largest (least negative) element.",
    explain="Walk the array carrying a running sum. If the running sum becomes worse than starting fresh at the current number, drop the past. Always remember the best running sum you have seen.",
    patternFlow="nums:     -2   1  -3   4  -1   2   1  -5   4\ncur:      -2   1  -2   4   3   5   6   1   5\nbest:     -2   1   1   4   4   5   6   6   6\n\ncur = max(x, cur + x)   // restart vs extend",
    important="Subarray must be contiguous and non-empty. All negatives: return the max element, not 0 (unless the problem says empty is allowed — here it does not).",
    snippetJava="""cur = Math.max(x, cur + x);
best = Math.max(best, cur);""",
    snippetPython="""cur = max(x, cur + x)
best = max(best, cur)""",
    java="""class Solution {
    public int maxSubArray(int[] nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }
}""",
    python="""class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)
            best = max(best, cur)
        return best""",
    complexity="Time O(n), Space O(1)",
    followUp="Return the actual subarray bounds by storing start/end when best updates. Maximum product subarray is a related but trickier variant because of negatives.",
)

add(
    id=6,
    lc=15,
    slug="3sum",
    title="3Sum",
    difficulty="Medium",
    pattern="Sort + Two Pointers",
    tags=["Array", "Two Pointers"],
    question="Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
    example="Input: nums = [-1, 0, 1, 2, -1, -4]\nOutput: [[-1, -1, 2], [-1, 0, 1]]",
    thinking="Three nested loops are O(n³) and messy with duplicates. Sort first. Fix index i, then two-pointer the rest for a pair that sums to −nums[i]. Skip duplicate values at i, L, and R so each triplet is unique. After sorting, two-sum on a sorted array is O(n), so total O(n²).",
    explain="Sort so equals sit together. Pick the first number. Then hunt a pair in the remaining slice that cancels it to zero — same as two-sum on a sorted list: small + large too big → move right inward; too small → move left inward.",
    patternFlow="sorted: -4  -1  -1  0  1  2\n         i   L              R\nfix i=-1, need 1:  L=-1 R=2 → -1+2=1  triplet [-1,-1,2]\nskip duplicate i and duplicate L/R after a hit",
    important="Dedup is the real interview trap. Sort first. Skip same nums[i] as previous i. After a hit, skip same L and R values. i stops at n-3. If nums[i] > 0, remaining numbers are also ≥ 0 so you can break.",
    snippetJava="""if (i > 0 && nums[i] == nums[i - 1]) continue;
int L = i + 1, R = n - 1;
while (L < R) {
    int sum = nums[i] + nums[L] + nums[R];
    if (sum == 0) { /* add; skip dups; L++; R--; */ }
    else if (sum < 0) L++;
    else R--;
}""",
    snippetPython="""if i > 0 and nums[i] == nums[i - 1]:
    continue
L, R = i + 1, n - 1
while L < R:
    s = nums[i] + nums[L] + nums[R]
    if s == 0:  # record, skip dups
        L += 1; R -= 1
    elif s < 0:
        L += 1
    else:
        R -= 1""",
    java="""class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int L = i + 1, R = n - 1;
            while (L < R) {
                int sum = nums[i] + nums[L] + nums[R];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[L], nums[R]));
                    L++; R--;
                    while (L < R && nums[L] == nums[L - 1]) L++;
                    while (L < R && nums[R] == nums[R + 1]) R--;
                } else if (sum < 0) {
                    L++;
                } else {
                    R--;
                }
            }
        }
        return res;
    }
}""",
    python="""class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        n, res = len(nums), []
        for i in range(n - 2):
            if nums[i] > 0:
                break
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            L, R = i + 1, n - 1
            while L < R:
                s = nums[i] + nums[L] + nums[R]
                if s == 0:
                    res.append([nums[i], nums[L], nums[R]])
                    L += 1
                    R -= 1
                    while L < R and nums[L] == nums[L - 1]:
                        L += 1
                    while L < R and nums[R] == nums[R + 1]:
                        R -= 1
                elif s < 0:
                    L += 1
                else:
                    R -= 1
        return res""",
    complexity="Time O(n²), Space O(1) extra besides output (sort may use O(log n))",
    followUp="4Sum generalizes with another nested index. If they ask unique vs all index triples, unique values is this problem.",
)

add(
    id=7,
    lc=11,
    slug="container-with-most-water",
    title="Container With Most Water",
    difficulty="Medium",
    pattern="Two Pointers",
    tags=["Array", "Two Pointers", "Greedy"],
    question="You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water. You may not slant the container.",
    example="Input: height = [1, 8, 6, 2, 5, 4, 8, 3, 7]\nOutput: 49\nLines at index 1 (height 8) and index 8 (height 7): width = 7, min height = 7 → 49.",
    thinking="Area = width × min(h[L], h[R]). Starting at both ends maximizes width. The shorter wall is the bottleneck. Moving the taller wall cannot help — min height stays ≤ the short one and width shrinks. So move the shorter pointer inward, hoping for a taller wall. O(n), not O(n²) pairs.",
    explain="Two walls of a tank. Water height is the shorter wall. Start with the widest tank. Always replace the short wall; the tall one is already as good as it can be for this partner.",
    patternFlow="L ------------------------------- R\narea = (R-L) * min(h[L], h[R])\nif h[L] < h[R]: L++   else: R--\nrepeat until L == R; keep max area",
    important="Water cannot slant — min of the two heights. Width is index difference, not count of bars. Do not confuse with Trapping Rain Water (that one fills valleys).",
    snippetJava="""int area = (R - L) * Math.min(height[L], height[R]);
max = Math.max(max, area);
if (height[L] < height[R]) L++;
else R--;""",
    snippetPython="""area = (R - L) * min(height[L], height[R])
best = max(best, area)
if height[L] < height[R]:
    L += 1
else:
    R -= 1""",
    java="""class Solution {
    public int maxArea(int[] height) {
        int L = 0, R = height.length - 1, best = 0;
        while (L < R) {
            best = Math.max(best, (R - L) * Math.min(height[L], height[R]));
            if (height[L] < height[R]) L++;
            else R--;
        }
        return best;
    }
}""",
    python="""class Solution:
    def maxArea(self, height: List[int]) -> int:
        L, R, best = 0, len(height) - 1, 0
        while L < R:
            best = max(best, (R - L) * min(height[L], height[R]))
            if height[L] < height[R]:
                L += 1
            else:
                R -= 1
        return best""",
    complexity="Time O(n), Space O(1)",
    followUp="Why move the shorter pointer? Prove that any pair skipped cannot beat the current max for that short wall.",
)

add(
    id=8,
    lc=3,
    slug="longest-substring-without-repeating-characters",
    title="Longest Substring Without Repeating Characters",
    difficulty="Medium",
    pattern="Sliding Window",
    tags=["String", "Sliding Window", "Hash Map"],
    question="Given a string s, find the length of the longest substring without repeating characters.",
    example="Input: s = \"abcabcbb\"\nOutput: 3  (\"abc\")\n\nInput: s = \"bbbbb\"\nOutput: 1  (\"b\")\n\nInput: s = \"pwwkew\"\nOutput: 3  (\"wke\")",
    thinking="Substring means contiguous. Expand the right pointer. When a duplicate enters the window, shrink the left until the window is unique again. A map (or last-seen index) lets you jump left past the previous occurrence. Answer is max window size, not the string itself unless asked.",
    explain="A moving window on the string. Add characters on the right. If a character repeats, slide the left edge forward until that character appears only once. The longest such clean window is the answer.",
    patternFlow="s: a b c a b c b b\n   [a b c] a          len 3\n     [b c a]          len 3\n       [c a b]        len 3\n         [a b c]      len 3\n             [b] [b]  len 1\n\nlast[ch] = index; if last[ch] >= left, left = last[ch] + 1",
    important="Substring ≠ subsequence. 'pwwkew' answer is 3 (wke), not pwke (not contiguous). Empty string → 0. ASCII vs Unicode: map size 128/256 is a common optimization.",
    snippetJava="""if (map.containsKey(c) && map.get(c) >= left) {
    left = map.get(c) + 1;
}
map.put(c, right);
best = Math.max(best, right - left + 1);""",
    snippetPython="""if c in last and last[c] >= left:
    left = last[c] + 1
last[c] = right
best = max(best, right - left + 1)""",
    java="""class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (last.containsKey(c) && last.get(c) >= left) {
                left = last.get(c) + 1;
            }
            last.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}""",
    python="""class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}
        left = best = 0
        for right, c in enumerate(s):
            if c in last and last[c] >= left:
                left = last[c] + 1
            last[c] = right
            best = max(best, right - left + 1)
        return best""",
    complexity="Time O(n), Space O(min(n, alphabet))",
    followUp="Return the actual substring by storing start index when best updates. Longest substring with at most k distinct characters is the next pattern drill.",
)

add(
    id=9,
    lc=76,
    slug="minimum-window-substring",
    title="Minimum Window Substring",
    difficulty="Hard",
    pattern="Sliding Window (need count)",
    tags=["String", "Sliding Window", "Hash Map"],
    question="Given two strings s and t of lengths m and n, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\". The test cases will be generated such that the answer is unique.",
    example="Input: s = \"ADOBECODEBANC\", t = \"ABC\"\nOutput: \"BANC\"\nExplanation: The minimum window substring \"BANC\" includes 'A', 'B', and all of 'C'.",
    thinking="Need every char of t, with frequencies. Expand right, decrement need when a required char is satisfied. When have == required, shrink left as much as possible while still valid, record the smallest window, then keep sliding. A need map + a 'have' counter avoids scanning the whole window each time.",
    explain="You must cover a shopping list t inside a longer aisle s. Grow the window until the list is covered. Then shrink from the left to make it as short as possible. Repeat as you walk further down the aisle. Keep the shortest covering stretch.",
    patternFlow="t = ABC  (need A:1 B:1 C:1, required=3)\ns = A D O B E C O D E B A N C\n         [A D O B E C] cover, shrink\n                   ... [B A N C]  length 4  ← best",
    important="Duplicates in t matter (t='AABC' needs two A's). Case-sensitive. Unique answer guaranteed. Track window start+len, not all candidates. Extra chars in s are allowed; missing required chars are not.",
    snippetJava="""need[c]--; if (need[c] >= 0) have++;
while (have == required) {
    // record if smaller
    need[s.charAt(L)]++;
    if (need[s.charAt(L)] > 0) have--;
    L++;
}""",
    snippetPython="""need[c] -= 1
if need[c] >= 0:
    have += 1
while have == required:
    # record window, then pop left
    need[s[L]] += 1
    if need[s[L]] > 0:
        have -= 1
    L += 1""",
    java="""class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        int required = t.length(), have = 0;
        int best = Integer.MAX_VALUE, start = 0, L = 0;
        for (int R = 0; R < s.length(); R++) {
            char c = s.charAt(R);
            need[c]--;
            if (need[c] >= 0) have++;
            while (have == required) {
                if (R - L + 1 < best) {
                    best = R - L + 1;
                    start = L;
                }
                char left = s.charAt(L++);
                need[left]++;
                if (need[left] > 0) have--;
            }
        }
        return best == Integer.MAX_VALUE ? \"\" : s.substring(start, start + best);
    }
}""",
    python="""class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = [0] * 128
        for ch in t:
            need[ord(ch)] += 1
        required, have = len(t), 0
        best, start, L = float('inf'), 0, 0
        for R, ch in enumerate(s):
            o = ord(ch)
            need[o] -= 1
            if need[o] >= 0:
                have += 1
            while have == required:
                if R - L + 1 < best:
                    best = R - L + 1
                    start = L
                left = ord(s[L])
                L += 1
                need[left] += 1
                if need[left] > 0:
                    have -= 1
        return '' if best == float('inf') else s[start:start + best]""",
    complexity="Time O(|s| + |t|), Space O(alphabet)",
    followUp="Find Anagrams in a String is the same skeleton with a fixed window length.",
)

add(
    id=10,
    lc=20,
    slug="valid-parentheses",
    title="Valid Parentheses",
    difficulty="Easy",
    pattern="Stack",
    tags=["String", "Stack"],
    question="Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets, and in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    example="Input: s = \"()[]{}\"\nOutput: true\n\nInput: s = \"(]\"\nOutput: false\n\nInput: s = \"([)]\"\nOutput: false\n\nInput: s = \"{[]}\"\nOutput: true",
    thinking="Classic stack. Push opens. On close, the top must be the matching open. Empty stack at the end. Interleaving like ([)] fails because the top is the wrong type. Odd length can still be invalid; length check is only a fast reject if odd.",
    explain="Think of plates. Each open bracket is a plate you stack. A close bracket must match the top plate. If it does not, or the stack is empty, the sequence is broken. At the end no plates should remain.",
    patternFlow="s = { [ ] }\nstack: { → { [ → {  (pop [) → {  (pop {) → empty  ✓\n\ns = ( [ ) ]\nstack: ( → ( [ → pop [ vs )  mismatch ✗",
    important="Order matters, not just counts. ([)] is invalid. Stack must be empty at the end (extra opens). Closing on empty stack is invalid.",
    snippetJava="""if (open.contains(c)) stack.push(c);
else if (stack.isEmpty() || stack.pop() != match.get(c)) return false;""",
    snippetPython="""if c in '([{':
    stack.append(c)
elif not stack or stack.pop() != match[c]:
    return False""",
    java="""class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        Map<Character, Character> match = Map.of(')', '(', ']', '[', '}', '{');
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty() || stack.pop() != match.get(c)) return false;
            }
        }
        return stack.isEmpty();
    }
}""",
    python="""class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        match = {')': '(', ']': '[', '}': '{'}
        for c in s:
            if c in '([{':
                stack.append(c)
            elif not stack or stack.pop() != match[c]:
                return False
        return not stack""",
    complexity="Time O(n), Space O(n)",
    followUp="Generate Parentheses / Longest Valid Parentheses are the next stack/DP cousins.",
)

add(
    id=11,
    lc=56,
    slug="merge-intervals",
    title="Merge Intervals",
    difficulty="Medium",
    pattern="Sort + Sweep",
    tags=["Array", "Intervals", "Sorting"],
    question="Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    example="Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\n[1,3] and [2,6] overlap, so merge to [1,6].",
    thinking="Unsorted intervals cannot be merged in one pass. Sort by start. Walk left to right: if the next interval starts before or at the current end, they overlap — extend the end. Otherwise push the current and start a new one. Touching edges [1,4][4,5] usually merge (closed intervals).",
    explain="Put meetings on a timeline by start time. If the next meeting starts before the current one finishes, it is the same busy block — stretch the end. If there is a gap, close the previous block and open a new one.",
    patternFlow="sort by start:\n[1,3] [2,6] [8,10] [15,18]\n[1,3] + [2,6] overlap → [1,6]\n[1,6] vs [8,10] gap → emit [1,6], current=[8,10]\n...",
    important="Sort first. Overlap test: next.start <= current.end (for closed intervals). Merge by max(end). Do not assume input is sorted.",
    snippetJava="""if (curr[0] <= last[1]) last[1] = Math.max(last[1], curr[1]);
else merged.add(curr);""",
    snippetPython="""if curr[0] <= last[1]:
    last[1] = max(last[1], curr[1])
else:
    merged.append(curr)""",
    java="""class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] curr : intervals) {
            if (merged.isEmpty() || curr[0] > merged.get(merged.size() - 1)[1]) {
                merged.add(curr);
            } else {
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], curr[1]);
            }
        }
        return merged.toArray(new int[merged.size()][]);
    }
}""",
    python="""class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []
        for curr in intervals:
            if not merged or curr[0] > merged[-1][1]:
                merged.append(curr)
            else:
                merged[-1][1] = max(merged[-1][1], curr[1])
        return merged""",
    complexity="Time O(n log n), Space O(n) for the output",
    followUp="Insert Interval, Meeting Rooms II (min heaps / sweep line counts).",
)

add(
    id=12,
    lc=42,
    slug="trapping-rain-water",
    title="Trapping Rain Water",
    difficulty="Hard",
    pattern="Two Pointers / Precompute Max",
    tags=["Array", "Two Pointers"],
    question="Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    example="Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nWater sits in the valleys between taller bars; total trapped units = 6.",
    thinking="Water at i is min(maxLeft, maxRight) − height[i], if positive. Two extra arrays work in O(n). Two pointers do it in O(1) space: the side with the smaller max is the bottleneck. Process that side, because min(maxL, maxR) is determined by the smaller max. Do not confuse with Container With Most Water (one rectangle vs filling every valley).",
    explain="Each bar can hold water up to the shorter of the tallest wall on its left and on its right, minus its own height. Walk from both ends. Always fill the side whose bounding wall is currently shorter — that wall is the lid for that cell.",
    patternFlow="height: 0 1 0 2 1 0 1 3 2 1 2 1\nwater:    0 1 0 1 2 1 0 0 1 0 0   sum=6\n\nwater[i] = max(0, min(maxL[i], maxR[i]) - height[i])",
    important="Width of each bar is 1. Ends cannot trap water. Different from 'container with most water'. Two-pointer invariant: process the side with smaller max.",
    snippetJava="""if (maxL <= maxR) {
    L++; maxL = Math.max(maxL, height[L]);
    water += maxL - height[L];
} else {
    R--; maxR = Math.max(maxR, height[R]);
    water += maxR - height[R];
}""",
    snippetPython="""if maxL <= maxR:
    L += 1
    maxL = max(maxL, height[L])
    water += maxL - height[L]
else:
    R -= 1
    maxR = max(maxR, height[R])
    water += maxR - height[R]""",
    java="""class Solution {
    public int trap(int[] height) {
        int L = 0, R = height.length - 1;
        int maxL = 0, maxR = 0, water = 0;
        while (L < R) {
            if (height[L] <= height[R]) {
                if (height[L] >= maxL) maxL = height[L];
                else water += maxL - height[L];
                L++;
            } else {
                if (height[R] >= maxR) maxR = height[R];
                else water += maxR - height[R];
                R--;
            }
        }
        return water;
    }
}""",
    python="""class Solution:
    def trap(self, height: List[int]) -> int:
        L, R = 0, len(height) - 1
        maxL = maxR = water = 0
        while L < R:
            if height[L] <= height[R]:
                if height[L] >= maxL:
                    maxL = height[L]
                else:
                    water += maxL - height[L]
                L += 1
            else:
                if height[R] >= maxR:
                    maxR = height[R]
                else:
                    water += maxR - height[R]
                R -= 1
        return water""",
    complexity="Time O(n), Space O(1)",
    followUp="Stack of decreasing bars also works: pop when a higher bar closes a valley.",
)

add(
    id=13,
    lc=206,
    slug="reverse-linked-list",
    title="Reverse Linked List",
    difficulty="Easy",
    pattern="In-place Pointer Reversal",
    tags=["Linked List"],
    question="Given the head of a singly linked list, reverse the list, and return the reversed list's head.",
    example="Input: 1 → 2 → 3 → 4 → 5 → null\nOutput: 5 → 4 → 3 → 2 → 1 → null",
    thinking="Iterative: three pointers prev, curr, next. Save next, point curr to prev, advance. Recursion is elegant but O(n) stack. Empty list and single node are no-ops. Interviewers want you to draw the pointer swing before coding.",
    explain="Each node currently points forward. You walk the chain and make each node point to the one behind it. You must save the next node first, or you lose the rest of the list.",
    patternFlow="prev  curr  next\nnull   1  →  2 → 3\n       1  → null    (curr.next = prev)\n      prev=1 curr=2\n...\nreturn prev (new head)",
    important="Save next before rewiring. New head is the old tail (last prev). Do not forget to return the new head, not the original head.",
    snippetJava="""ListNode next = curr.next;
curr.next = prev;
prev = curr;
curr = next;""",
    snippetPython="""nxt = curr.next
curr.next = prev
prev, curr = curr, nxt""",
    java="""class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}""",
    python="""class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, curr = None, head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev, curr = curr, nxt
        return prev""",
    complexity="Time O(n), Space O(1) iterative",
    followUp="Reverse Linked List II (sublist). Reverse nodes in k-group. Recursion version for follow-up.",
)

add(
    id=14,
    lc=141,
    slug="linked-list-cycle",
    title="Linked List Cycle",
    difficulty="Easy",
    pattern="Fast / Slow Pointers",
    tags=["Linked List", "Two Pointers"],
    question="Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle if some node can be reached again by continuously following the next pointer. Return true if there is a cycle, otherwise false.",
    example="Input: 3 → 2 → 0 → -4  and -4 points back to 2\nOutput: true",
    thinking="A hash set of visited nodes is O(n) space. Floyd: slow = +1, fast = +2. If they meet, there is a cycle. If fast hits null, no cycle. Why it works: in a loop, the faster runner laps the slower one. Do not dereference fast.next without null checks.",
    explain="Two people jogging on a path. If the path is a loop, the faster jogger will catch the slower one. If the path ends, the fast jogger reaches the finish and there is no loop.",
    patternFlow="slow: 1 step    fast: 2 steps\nno cycle: fast reaches null\ncycle: fast laps slow → same node",
    important="Check fast and fast.next before moving fast by 2. Meeting node is not necessarily the cycle start (that is Linked List Cycle II).",
    snippetJava="""slow = slow.next;
fast = fast.next.next;
if (slow == fast) return true;""",
    snippetPython="""slow = slow.next
fast = fast.next.next
if slow is fast:
    return True""",
    java="""class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}""",
    python="""class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False""",
    complexity="Time O(n), Space O(1)",
    followUp="Cycle II: after meeting, send one pointer to head; both +1; they meet at cycle start.",
)

add(
    id=15,
    lc=21,
    slug="merge-two-sorted-lists",
    title="Merge Two Sorted Lists",
    difficulty="Easy",
    pattern="Dummy Head",
    tags=["Linked List", "Two Pointers"],
    question="You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    example="Input: list1 = 1 → 2 → 4, list2 = 1 → 3 → 4\nOutput: 1 → 1 → 2 → 3 → 4 → 4",
    thinking="Dummy node avoids a special case for the first node. Always attach the smaller head, advance that list. When one list empties, attach the rest of the other. Do not allocate new nodes unless asked — splice existing nodes.",
    explain="Two sorted queues. Always take the smaller front ticket and stitch it onto the result. When one queue is empty, dump the other onto the end. A dummy starter node means you never fuss over 'who is first'.",
    patternFlow="dummy → (tail)\ncompare l1.val vs l2.val\nattach smaller, advance that pointer\ntail = tail.next\nfinally tail.next = leftover list\nreturn dummy.next",
    important="Lists are already sorted. Dummy head. Return dummy.next, not dummy. One list may be null.",
    snippetJava="""if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
else { tail.next = l2; l2 = l2.next; }
tail = tail.next;""",
    snippetPython="""if l1.val <= l2.val:
    tail.next, l1 = l1, l1.next
else:
    tail.next, l2 = l2, l2.next
tail = tail.next""",
    java="""class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
            else { tail.next = l2; l2 = l2.next; }
            tail = tail.next;
        }
        tail.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }
}""",
    python="""class Solution:
    def mergeTwoLists(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode(0)
        while l1 and l2:
            if l1.val <= l2.val:
                tail.next, l1 = l1, l1.next
            else:
                tail.next, l2 = l2, l2.next
            tail = tail.next
        tail.next = l1 or l2
        return dummy.next""",
    complexity="Time O(n + m), Space O(1)",
    followUp="Merge k sorted lists: heap of heads, O(N log k).",
)

add(
    id=16,
    lc=200,
    slug="number-of-islands",
    title="Number of Islands",
    difficulty="Medium",
    pattern="DFS / BFS Flood Fill",
    tags=["Grid", "DFS", "BFS", "Graph"],
    question="Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically (not diagonally).",
    example="Input:\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1\nOutput: 3",
    thinking="Each connected component of 1s is one island. Scan the grid; when you find a 1, increment count and flood-fill (DFS/BFS) marking visited as 0 or a visited matrix so you do not recount. 4-direction only. Union-Find is an alternative.",
    explain="Walk every cell. When you step on unused land, that is a new island. Then paint the whole connected land mass so you never count those cells again. Painting is DFS or BFS.",
    patternFlow="for each cell (r,c):\n  if grid[r][c] == '1':\n      islands++\n      dfs mark all 4-connected '1' as '0'\n\n  (r,c)\n    N\n  W + E\n    S     no diagonals",
    important="4-direction, not 8. Grid is chars '1'/'0' not ints. Mutating the grid in place saves a visited array. Bounds checks before recursion.",
    snippetJava="""if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] != '1') return;
grid[r][c] = '0';
dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);""",
    snippetPython="""if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] != '1':
    return
grid[r][c] = '0'
for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
    dfs(r+dr, c+dc)""",
    java="""class Solution {
    public int numIslands(char[][] grid) {
        int m = grid.length, n = grid[0].length, count = 0;
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
    void dfs(char[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '0';
        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);
    }
}""",
    python="""class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        def dfs(r, c):
            if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] != '1':
                return
            grid[r][c] = '0'
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
        count = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == '1':
                    count += 1
                    dfs(r, c)
        return count""",
    complexity="Time O(m × n), Space O(m × n) worst-case recursion / queue",
    followUp="Max Area of Island, Surrounded Regions, Number of Distinct Islands.",
)

add(
    id=17,
    lc=207,
    slug="course-schedule",
    title="Course Schedule",
    difficulty="Medium",
    pattern="Graph Topological Sort",
    tags=["Graph", "BFS", "DFS", "Topological Sort"],
    question="There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.",
    example="Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: true  (take 0 then 1)\n\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false  (cycle)",
    thinking="This is cycle detection in a directed graph. Edge b → a means 'b before a'. Kahn's algorithm: indegree 0 queue, peel nodes, if you peel all courses you can finish. DFS coloring (white/gray/black) also works; gray back-edge = cycle. Clarify edge direction aloud.",
    explain="Courses are nodes. A prereq is an arrow 'must do this before that'. If arrows form a loop, you can never start. Peel courses that have nothing blocking them, then unlock neighbors. If leftover courses remain, there was a loop.",
    patternFlow="edge: bi → ai  (bi first)\nindegree[ai]++\nqueue all indegree 0\nwhile queue: pop, taken++, reduce neighbors\nreturn taken == numCourses",
    important="prerequisites[i] = [ai, bi] means bi first, then ai. Cycle = false. Isolated courses are fine (indegree 0). Graph may be disconnected.",
    snippetJava="""if (indegree[next] == 0) q.offer(next);
taken++;
return taken == numCourses;""",
    snippetPython="""indegree[nxt] -= 1
if indegree[nxt] == 0:
    q.append(nxt)
return taken == numCourses""",
    java="""class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> g = new ArrayList<>();
        int[] indeg = new int[numCourses];
        for (int i = 0; i < numCourses; i++) g.add(new ArrayList<>());
        for (int[] p : prerequisites) {
            g.get(p[1]).add(p[0]);
            indeg[p[0]]++;
        }
        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.offer(i);
        int taken = 0;
        while (!q.isEmpty()) {
            int c = q.poll();
            taken++;
            for (int next : g.get(c)) {
                if (--indeg[next] == 0) q.offer(next);
            }
        }
        return taken == numCourses;
    }
}""",
    python="""from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        g = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            g[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        taken = 0
        while q:
            c = q.popleft()
            taken += 1
            for nxt in g[c]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return taken == numCourses""",
    complexity="Time O(V + E), Space O(V + E)",
    followUp="Course Schedule II: return a valid order (the Kahn pop sequence).",
)

add(
    id=18,
    lc=102,
    slug="binary-tree-level-order-traversal",
    title="Binary Tree Level Order Traversal",
    difficulty="Medium",
    pattern="BFS by Level",
    tags=["Tree", "BFS"],
    question="Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    example="Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
    thinking="Queue BFS. The trick is grouping by level: snapshot queue size before processing a level, pop that many nodes, push children. DFS with a depth index into a list of lists also works. Null root → empty list, not [[]]",
    explain="Visit the tree floor by floor, left to right, like a building. A queue holds the current floor. Process everyone on that floor, and while doing so line up their children for the next floor.",
    patternFlow="queue: [3]\nlevel 0: 3        enqueue 9, 20\nlevel 1: 9, 20    enqueue 15, 7\nlevel 2: 15, 7",
    important="Capture size at the start of each level. Left child then right child. Empty tree returns [].",
    snippetJava="""int size = q.size();
List<Integer> level = new ArrayList<>();
for (int i = 0; i < size; i++) { /* poll, add val, offer children */ }""",
    snippetPython="""size = len(q)
level = []
for _ in range(size):
    node = q.popleft()
    level.append(node.val)
    if node.left: q.append(node.left)
    if node.right: q.append(node.right)""",
    java="""class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode n = q.poll();
                level.add(n.val);
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            res.add(level);
        }
        return res;
    }
}""",
    python="""from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            level = []
            for _ in range(len(q)):
                n = q.popleft()
                level.append(n.val)
                if n.left: q.append(n.left)
                if n.right: q.append(n.right)
            res.append(level)
        return res""",
    complexity="Time O(n), Space O(n) for the queue / output",
    followUp="Zigzag level order: reverse every other level. Right side view: last node of each level.",
)

add(
    id=19,
    lc=98,
    slug="validate-binary-search-tree",
    title="Validate Binary Search Tree",
    difficulty="Medium",
    pattern="DFS with Bounds",
    tags=["Tree", "DFS", "BST"],
    question="Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST: the left subtree of a node contains only nodes with keys strictly less than the node's key; the right subtree only strictly greater; both subtrees must also be BSTs.",
    example="Input: [2,1,3] → true\nInput: [5,1,4,null,null,3,6] → false (3 is in the right subtree of 5 but 3 < 5)",
    thinking="Checking only node.left.val < node.val < node.right.val is WRONG — a node can sit several levels down and still violate the ancestor. Pass (low, high) bounds down the tree. Left child inherits (low, node.val); right inherits (node.val, high). Use long min/max in Java to avoid int overflow at Integer.MIN/MAX. Inorder strictly increasing is an equivalent check.",
    explain="Every node lives in a legal numeric range inherited from ancestors. Go left: the ceiling becomes the parent. Go right: the floor becomes the parent. If a node falls outside its range, it is not a BST.",
    patternFlow="""        5
       / \\
      1   4
         / \\
        3   6
node 3 has bounds (5, 4) from path 5→4→3  → 3 is not > 5  invalid

validate(node, low, high):
  if node is null: true
  if not (low < node.val < high): false
  left (low, node.val) AND right (node.val, high)""",
    important="Strictly less / greater (no duplicates in classic LeetCode BST). Must bound the whole subtree, not just children. Integer.MIN_VALUE as a node value exists — use null bounds or long.",
    snippetJava="""if (node.val <= low || node.val >= high) return false;
return dfs(node.left, low, node.val) && dfs(node.right, node.val, high);""",
    snippetPython="""if not (low < node.val < high):
    return False
return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)""",
    java="""class Solution {
    public boolean isValidBST(TreeNode root) {
        return dfs(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
    boolean dfs(TreeNode node, long low, long high) {
        if (node == null) return true;
        if (node.val <= low || node.val >= high) return false;
        return dfs(node.left, low, node.val) && dfs(node.right, node.val, high);
    }
}""",
    python="""class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def dfs(node, low, high):
            if not node:
                return True
            if not (low < node.val < high):
                return False
            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)
        return dfs(root, float('-inf'), float('inf'))""",
    complexity="Time O(n), Space O(h) recursion",
    followUp="Inorder: keep prev pointer, require node.val > prev.val at every visit.",
)

add(
    id=20,
    lc=236,
    slug="lowest-common-ancestor-of-a-binary-tree",
    title="Lowest Common Ancestor of a Binary Tree",
    difficulty="Medium",
    pattern="DFS Recursion (Tree)",
    tags=["Tree", "DFS"],
    question="Given a binary tree, find the lowest common ancestor (LCA) of two given nodes p and q. The LCA is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (a node can be a descendant of itself).",
    example="Tree: 3 as root; 5 left, 1 right; 5 has 6 and 2. LCA(5, 1) = 3. LCA(6, 2) = 5. LCA(7, 6) under 2 and 5 = 5.",
    thinking="Not a BST — cannot use value compare. DFS: if root is null or root is p or q, return root. Recurse left and right. If both sides return non-null, root is LCA. If only one side, bubble that up (the other node sits under that side, or we found one target). 'Node can be descendant of itself' covers p being ancestor of q.",
    explain="Search left and right for p and q. If they split across both sides, the current node is the fork — that is the LCA. If both sit on one side, the LCA is deeper on that side. If the current node is p or q, you can stop — it is an ancestor of the other if the other is below.",
    patternFlow="dfs(root):\n  if root in {null, p, q}: return root\n  L = dfs(left); R = dfs(right)\n  if L and R: return root   // split\n  return L or R             // one side",
    important="This is a general binary tree, not BST (BST LCA is simpler with values). A node can be its own ancestor. p and q are guaranteed to exist in the LeetCode statement.",
    snippetJava="""if (root == null || root == p || root == q) return root;
TreeNode L = lowestCommonAncestor(root.left, p, q);
TreeNode R = lowestCommonAncestor(root.right, p, q);
if (L != null && R != null) return root;
return L != null ? L : R;""",
    snippetPython="""if not root or root is p or root is q:
    return root
L = self.lowestCommonAncestor(root.left, p, q)
R = self.lowestCommonAncestor(root.right, p, q)
if L and R:
    return root
return L or R""",
    java="""class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode L = lowestCommonAncestor(root.left, p, q);
        TreeNode R = lowestCommonAncestor(root.right, p, q);
        if (L != null && R != null) return root;
        return L != null ? L : R;
    }
}""",
    python="""class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root is p or root is q:
            return root
        L = self.lowestCommonAncestor(root.left, p, q)
        R = self.lowestCommonAncestor(root.right, p, q)
        if L and R:
            return root
        return L or R""",
    complexity="Time O(n), Space O(h)",
    followUp="BST LCA: walk from root, go left if both < root, right if both > root, else root is split.",
)

add(
    id=21,
    lc=70,
    slug="climbing-stairs",
    title="Climbing Stairs",
    difficulty="Easy",
    pattern="1D DP (Fibonacci)",
    tags=["DP"],
    question="You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    example="Input: n = 2 → 2 ways: 1+1, 2\nInput: n = 3 → 3 ways: 1+1+1, 1+2, 2+1",
    thinking="To reach step n you came from n-1 (one step) or n-2 (two steps). ways(n) = ways(n-1) + ways(n-2). Base: 1 way for 1 step, 2 ways for 2 steps. This is Fibonacci. O(n) time, O(1) space with two rolling variables. Recursion without memo is exponential — mention that then optimize.",
    explain="The last move is either a single step from n-1 or a double from n-2. Add those two counts. Same shape as Fibonacci numbers.",
    patternFlow="n:     1  2  3  4  5\nways:  1  2  3  5  8\n\ndp[i] = dp[i-1] + dp[i-2]",
    important="Order matters: 1+2 and 2+1 are different. n can be 45 — int is enough in Java; recursive naive TLE.",
    snippetJava="""int a = 1, b = 1; // ways(0), ways(1)
for (int i = 2; i <= n; i++) {
    int c = a + b; a = b; b = c;
}""",
    snippetPython="""a, b = 1, 1
for _ in range(2, n + 1):
    a, b = b, a + b""",
    java="""class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}""",
    python="""class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b""",
    complexity="Time O(n), Space O(1)",
    followUp="Min cost climbing stairs. Climbing with 1..k steps: dp[i] = sum of last k.",
)

add(
    id=22,
    lc=198,
    slug="house-robber",
    title="House Robber",
    difficulty="Medium",
    pattern="1D DP (skip adjacent)",
    tags=["DP", "Array"],
    question="You are a professional robber planning to rob houses along a street. Each house has a certain amount of money. Adjacent houses have security systems connected, so you cannot rob two adjacent houses. Given an integer array nums representing the amount of money of each house, return the maximum amount you can rob tonight without alerting the police.",
    example="Input: nums = [1,2,3,1]\nOutput: 4  (rob house 1 and 3: 1 + 3)\n\nInput: nums = [2,7,9,3,1]\nOutput: 12  (2 + 9 + 1)",
    thinking="At house i: skip it (take dp[i-1]) or rob it (nums[i] + dp[i-2]). Max of those. Rolling two variables. Empty / one house edge cases. House Robber II is a circle — split into [0..n-2] and [1..n-1].",
    explain="For each house: steal here and skip the previous, or skip here and keep the previous best. Pick the better. You never need more history than two houses back.",
    patternFlow="nums:  2  7  9  3  1\ndp:    2  7 11 11 12\n\ndp[i] = max(dp[i-1], nums[i] + dp[i-2])",
    important="Cannot rob adjacent houses. Linear street (II is circular). Max money, not the house list (unless asked).",
    snippetJava="""int rob = 0, skip = 0;
for (int x : nums) {
    int nRob = skip + x;
    skip = Math.max(skip, rob);
    rob = nRob;
}""",
    snippetPython="""prev2 = prev1 = 0
for x in nums:
    prev2, prev1 = prev1, max(prev1, prev2 + x)""",
    java="""class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = Math.max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}""",
    python="""class Solution:
    def rob(self, nums: List[int]) -> int:
        prev2 = prev1 = 0
        for x in nums:
            prev2, prev1 = prev1, max(prev1, prev2 + x)
        return prev1""",
    complexity="Time O(n), Space O(1)",
    followUp="House Robber II: max(rob(nums[0:-1]), rob(nums[1:])). Delete and Earn uses the same recurrence after bucketing values.",
)

add(
    id=23,
    lc=322,
    slug="coin-change",
    title="Coin Change",
    difficulty="Medium",
    pattern="Unbounded Knapsack DP",
    tags=["DP", "BFS"],
    question="You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1. You may assume you have an infinite number of each kind of coin.",
    example="Input: coins = [1,2,5], amount = 11\nOutput: 3  (5+5+1)\n\nInput: coins = [2], amount = 3\nOutput: -1",
    thinking="Greedy (always largest coin) fails on [1,3,4] amount 6 (3+3 beats 4+1+1). DP: dp[x] = min coins to make x. dp[0]=0, others inf. For each amount a, try each coin: dp[a] = min(dp[a], dp[a-coin]+1). Unbounded — coins loop inside or outside is OK if you iterate amounts upward. Return -1 if still inf.",
    explain="Fill a table from 0 dollars up to amount. For each total, try adding one more coin of each type on top of a smaller total you already solved. Keep the cheapest combination.",
    patternFlow="amount 0 1 2 3 4 5 6 7 8 9 10 11\ndp     0 1 1 2 2 1 2 2 3 3  2  3\ncoins 1,2,5\n\ndp[a] = min(dp[a], dp[a-c] + 1) for each coin c <= a",
    important="Infinite supply (unbounded). Greedy is not always optimal. Impossible → -1, not 0. dp[0]=0. Order of loops: for a in 1..amount, for coin in coins.",
    snippetJava="""dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (int c : coins) {
        if (c <= a && dp[a - c] != INF)
            dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
}""",
    snippetPython="""dp[0] = 0
for a in range(1, amount + 1):
    for c in coins:
        if c <= a:
            dp[a] = min(dp[a], dp[a - c] + 1)""",
    java="""class Solution {
    public int coinChange(int[] coins, int amount) {
        int INF = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}""",
    python="""class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = amount + 1
        dp = [INF] * (amount + 1)
        dp[0] = 0
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)
        return -1 if dp[amount] > amount else dp[amount]""",
    complexity="Time O(amount × coins), Space O(amount)",
    followUp="Coin Change II counts combinations. BFS from 0 is an alternative for fewest coins.",
)

add(
    id=24,
    lc=146,
    slug="lru-cache",
    title="LRU Cache",
    difficulty="Medium",
    pattern="HashMap + Doubly Linked List",
    tags=["Design", "Hash Map", "Linked List"],
    question="Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement LRUCache(capacity), get(key) which returns the value or -1, and put(key, value) which updates or inserts. If capacity is exceeded, evict the least recently used key. Both get and put must run in O(1) average time.",
    example="LRUCache(2)\nput(1,1); put(2,2); get(1) → 1\nput(3,3);  // evicts key 2\nget(2) → -1\nput(4,4);  // evicts key 1\nget(1) → -1; get(3) → 3; get(4) → 4",
    thinking="O(1) get + O(1) eviction needs: hashmap for key → node, and a doubly linked list for recency. Head = most recent, tail = least recent (or dummy sentinels). get/put move node to head. On overflow, remove tail.prev. Python OrderedDict is a shortcut — mention it, but be ready to write the DLL. Dummy head/tail kill null edge cases.",
    explain="A dictionary finds the item instantly. A queue of usage order tells you who is stale. Doubly linked list lets you yank a node from the middle in O(1) when it is used again, then put it at the front as 'just used'. When full, throw away the back of the line.",
    patternFlow="dummyHead <-> (MRU) ... (LRU) <-> dummyTail\nmap: key → node\n\nget: map lookup → move node to head → return val\nput existing: update val, move to head\nput new: insert at head; if size > cap, remove tail",
    important="Both get and put count as use (refresh recency). Evict LRU not FIFO if some keys were reused. Dummy sentinels. Capacity at least 1 typically.",
    snippetJava="""void moveToHead(Node n) { remove(n); addAfterHead(n); }
void evictLRU() { Node lru = tail.prev; remove(lru); map.remove(lru.key); }""",
    snippetPython="""# OrderedDict: move_to_end(key); popitem(last=False) is LRU
self.od.move_to_end(key)
self.od.popitem(last=False)""",
    java="""class LRUCache {
    static class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    int cap;
    Map<Integer, Node> map = new HashMap<>();
    Node head = new Node(0, 0), tail = new Node(0, 0);

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;
        tail.prev = head;
    }
    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        moveToHead(n);
        return n.val;
    }
    public void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) {
            n.val = value;
            moveToHead(n);
            return;
        }
        Node x = new Node(key, value);
        map.put(key, x);
        addAfterHead(x);
        if (map.size() > cap) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }
    void moveToHead(Node n) { remove(n); addAfterHead(n); }
    void addAfterHead(Node n) {
        n.next = head.next; n.prev = head;
        head.next.prev = n; head.next = n;
    }
    void remove(Node n) {
        n.prev.next = n.next;
        n.next.prev = n.prev;
    }
}""",
    python="""from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.od = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.od:
            return -1
        self.od.move_to_end(key)
        return self.od[key]

    def put(self, key: int, value: int) -> None:
        if key in self.od:
            self.od.move_to_end(key)
        self.od[key] = value
        if len(self.od) > self.cap:
            self.od.popitem(last=False)""",
    complexity="Time O(1) per get/put, Space O(capacity)",
    followUp="LFU Cache adds frequency. Interviewers often ask you to draw dummy head/tail and the four pointer rewires.",
)

add(
    id=25,
    lc=33,
    slug="search-in-rotated-sorted-array",
    title="Search in Rotated Sorted Array",
    difficulty="Medium",
    pattern="Binary Search (rotated)",
    tags=["Array", "Binary Search"],
    question="There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not. You must write an algorithm with O(log n) runtime complexity.",
    example="Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4\n\nInput: nums = [4,5,6,7,0,1,2], target = 3\nOutput: -1",
    thinking="Still binary search, but one half is always sorted. Check which half is sorted (compare nums[L] and nums[mid]). If target lies inside the sorted half, shrink to that half; else search the other. Distinct values simplify equality. O(log n) is required — linear scan fails the interview.",
    explain="A rotated sorted array is two sorted pieces glued together. Mid sits in one of those pieces. Figure out which piece is cleanly sorted, then ask whether the target lives in that clean piece. If yes, throw away the other; if no, throw away the clean piece.",
    patternFlow="[4 5 6 7 0 1 2]  L=0 mid=3 (7) R=6\nnums[L]=4 <= 7 so left half sorted\ntarget 0 not in [4..7] → search right\n\nif nums[L] <= nums[mid]: left sorted\n  if nums[L] <= target < nums[mid]: R = mid-1 else L = mid+1\nelse: right sorted (symmetric)",
    important="Distinct values in this problem (duplicates → 81, worst O(n)). Must be O(log n). Check mid equality first. Inclusive bounds on the sorted range.",
    snippetJava="""if (nums[L] <= nums[mid]) {
    if (nums[L] <= target && target < nums[mid]) R = mid - 1;
    else L = mid + 1;
} else {
    if (nums[mid] < target && target <= nums[R]) L = mid + 1;
    else R = mid - 1;
}""",
    snippetPython="""if nums[L] <= nums[mid]:
    if nums[L] <= target < nums[mid]:
        R = mid - 1
    else:
        L = mid + 1
else:
    if nums[mid] < target <= nums[R]:
        L = mid + 1
    else:
        R = mid - 1""",
    java="""class Solution {
    public int search(int[] nums, int target) {
        int L = 0, R = nums.length - 1;
        while (L <= R) {
            int mid = L + (R - L) / 2;
            if (nums[mid] == target) return mid;
            if (nums[L] <= nums[mid]) {
                if (nums[L] <= target && target < nums[mid]) R = mid - 1;
                else L = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[R]) L = mid + 1;
                else R = mid - 1;
            }
        }
        return -1;
    }
}""",
    python="""class Solution:
    def search(self, nums: List[int], target: int) -> int:
        L, R = 0, len(nums) - 1
        while L <= R:
            mid = (L + R) // 2
            if nums[mid] == target:
                return mid
            if nums[L] <= nums[mid]:
                if nums[L] <= target < nums[mid]:
                    R = mid - 1
                else:
                    L = mid + 1
            else:
                if nums[mid] < target <= nums[R]:
                    L = mid + 1
                else:
                    R = mid - 1
        return -1""",
    complexity="Time O(log n), Space O(1)",
    followUp="Find Minimum in Rotated Sorted Array. With duplicates, if nums[L]==nums[mid]==nums[R], shrink both ends.",
)


def main():
    root = Path(__file__).resolve().parents[1]
    out = root / "js" / "dsa-leetcode-25-data.js"
    payload = json.dumps(P, indent=2, ensure_ascii=False)
    out.write_text(
        "/** 25 high-frequency LeetCode interview problems — data */\n"
        "window.DSA_LEETCODE_25 = " + payload + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(P)} problems to {out}")


if __name__ == "__main__":
    main()

