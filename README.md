# Words Words Words

Currently: swap letters, find words, with friends. (A work-in-progress)
<br/>
Eventually: Boggle but competitive.

Try it out at https://word-scramble-react.vercel.app/

![Screenshot 2024-02-16 at 10 11 08 PM](https://github.com/mikey555/word-scramble-react/assets/983004/cd53359f-6b09-4d54-91bd-613aef6b15a4)

![word scramble](https://github.com/mikey555/word-scramble-react/assets/983004/1921558d-553e-4f3a-a8b9-a2977598f689)

## Rules

Swap letters, find words, get points. The longer the word, the more points you get.
<br/>On your turn,
<ul>
  <li>(1) drag to swap a pair of letters</li>
  <li>(2) drag to select a word.</li>
</ul>
The player with the most points after 5 rounds wins.

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
// TODO
// run tests

// run in development
vercel dev

// deploy preview
vercel

// deploy prod
vercel deploy
```
Since websocket sessions are confined to a single tab, you can test multiplayer by opening a separate tab or window for each player.

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
