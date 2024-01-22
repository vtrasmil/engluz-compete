# Words Words Words

Currently: swap letters, find words, with friends. (A work-in-progress)
<br/>
Eventually: Boggle but competitive.

Try it out at https://word-scramble-react.vercel.app/

![lobby](https://github.com/mikey555/word-scramble-react/assets/983004/173d9b91-8ec2-40f1-a4aa-17f00ddf4ec8)

![words](https://github.com/mikey555/word-scramble-react/assets/983004/78bfc29b-fa85-45d3-b31a-ff73200a4ec5)


<p><i>(what's happening here: (1) player swaps letter I with B and (2) selects the word "RAIN". (3) The selected letters "re-roll", revealing new letters.)</i></p>

## Development
```
// development setup
git clone https://github.com/mikey555/word-scramble-react.git
cd word-scramble-react

// install dependencies
npm install
npm i -g vercel

```
Duplicate `.env.example` and rename `.env`.
Sign up for a [Vercel](https://vercel.com/) Hobby plan with a KV (Redis) storage. Add the four `KV_` env vars to your `.env`.
Unfortunately there's no documented way to run KV locally with RedisJSON support.
```

// run tests

// preview

// deploy

```

(rewrite) Since websocket sessions are confined to a tab, you can play multiplayer by opening separate tabs.

##

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
- shadcn/ui
- react-spring (animation)

Although I've implemented the foundations, the game is a work-in-progress. I'm now working on game design - coming up with engaging multiplayer experience.
