# NOTES

## Constraints 1 & 2

I kept the full filtered list in the DOM so printing works. With a status filter applied (e.g. SHIPPED) you get every matching row in the print output — around 1,700 rows across 50+ pages. That ruled out virtualisation.

To stop every keystroke from re-rendering thousands of rows I memoised the row component and only pass it stable props (the order object itself, selection flags, and handlers wrapped in useCallback). The list container still re-renders on type, but unchanged rows get skipped.

Trade-off is obvious: 5,000 real <tr> elements. Scroll isn't as smooth as a virtual list would be, especially on lower-end machines. I accepted that because print and Ctrl-F both have to work.

## Proof for constraint 2

I added a tiny debug counter (only active with ?debug=1). 

Without memo, typing a character made every visible row re-render (mount + updates). With memo, only the rows that actually changed (or the one whose selection index shifted) re-rendered. The rest stayed at their previous count.

You can see it live: run the app, open with ?debug=1, type into the search box and watch the Renders column. Profiler recording is in /evidence.

## Decisions

1. No list library at all.  
   I looked at @tanstack/react-virtual first because it's the usual answer for 5k rows. It would have broken printing though — only the visible window ends up in the DOM. That was a hard no given constraint 1. If the requirement had been "screen only, no print", virtual would have been the right call.

2. Filter state lives in a small module store using useSyncExternalStore + history API.  
   I avoided useState + useEffect (banned) and also avoided the common pattern of keeping state in React and syncing to the URL in an effect. The store owns the source of truth and components just subscribe. It would be the wrong shape if we later needed multiple independent filter bars on the same page, but for this screen it's fine.

3. replaceState while the user is typing, pushState only for discrete actions (status filter, clear, etc.).  
   Pushing every keystroke would make the back button painful. Debouncing the search was the other option but it adds noticeable lag and needs timers. replaceState feels right here; the only time you'd want per-keystroke history is if users actually needed to step back through partial search terms, which they don't.

