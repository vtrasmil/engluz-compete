# Words Words Words

Currently: swap letters, find words, with friends. (A work-in-progress)
<br/>
Eventually: Boggle but competitive.

Try it out at https://word-scramble-react.vercel.app/

<video src="https://github.com/mikey555/word-scramble-react/assets/983004/9cbbbcd6-aa4e-4b44-85ba-b8b199a603ec"></video>

<p><i>(what's happening here: (1) player swaps letter I with B and (2) selects the word "RAIN". (3) The selected letters "re-roll", revealing new letters.)</i></p>

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
- Ably pub-sub messaging
- Material UI
- react-spring (animation)

Although I've implemented the foundations, the game is a work-in-progress. I'm now working on game design - coming up with engaging multiplayer experience.
