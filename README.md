# Words Words Words

Swap letters, find words. (A work-in-progress)

Try it out at https://word-scramble-react.vercel.app/

<a href="https://word-scramble-react.vercel.app/">![Screen Recording 2023-10-24 at 12 25 10 AM](https://github.com/mikey555/word-scramble-react/assets/983004/8f4be654-54db-45d2-a899-50cb0866de73)</a>

## Key Features
- **Selecting words**: I implemented a custom hook `useSelectionDrag()` using PointerEvents.
- **Swapping letters**: I used [React DnD](https://react-dnd.github.io/react-dnd/about), a popular drag-and-drop library, to implement letter swapping. I also built a custom hook `useTransformAnimation()` that manages letter position and animation. Swapping works with both touch and mouse interaction.
- **Real-time multiplayer**: players can interact with a shared board. Built using pub-sub messaging client Ably.
- **Lobby**: players can start a game or join an existing game with a 4-letter room code. Rooms and game state is stored in Redis.

## Tools I Used
- React
- Typescript
- Redis DB for storing game state, rooms
- Tanstack / React Query
- T3: Next.js, tRPC, Tailwind CSS
- Some Material UI components

Although I've implemented the foundations, the game is a work-in-progress. I'm now working on game design - coming up with engaging multiplayer experience.
