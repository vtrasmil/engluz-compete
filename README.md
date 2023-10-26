# Words Words Words

Swap letters, find words. (A work-in-progress)

Try it out at https://word-scramble-react.vercel.app/

<a href="https://word-scramble-react.vercel.app/">![Screen Recording 2023-10-24 at 12 25 10 AM](https://github.com/mikey555/word-scramble-react/assets/983004/e8af9f14-22d9-4f65-a711-bc0ea30bdfa0)</a>

## Key Features
- **Selecting words**: selected word is validated via dictionary in Redis. I implemented a custom hook `useSelectionDrag()` using PointerEvents.
- **Swapping letters**: I used [React DnD](https://react-dnd.github.io/react-dnd/about), a popular drag-and-drop library, to implement letter swapping. I also built a custom hook `useTransformAnimation()` that manages letter position and animation. Swapping works with both touch and mouse interaction.
- **Real-time multiplayer**: players can interact with a shared board. Built using pub-sub messaging client Ably.
- **Lobby**: players can start a game or join an existing game with a 4-letter room code.

## Tools I Used
- React
- Typescript
- Redis DB for storing game state, rooms, and dictionary
- Tanstack / React Query
- T3: Next.js, tRPC, Tailwind CSS
- Some Material UI components

Although I've implemented the foundations, the game is a work-in-progress. I'm now working on game design - coming up with engaging multiplayer experience.
