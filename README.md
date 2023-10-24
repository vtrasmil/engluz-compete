# Words Words Words

Swap letters, find words. So far, the foundations of an in-progress word game.

Try it out at https://word-scramble-react.vercel.app/

<a href="https://word-scramble-react.vercel.app/"><img src="https://github-production-user-asset-6210df.s3.amazonaws.com/983004/277568274-416165ca-ca55-4b43-9e86-92136934117d.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20231024%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231024T063716Z&X-Amz-Expires=300&X-Amz-Signature=da4c320a779085eb32a7776bc68f3b8f8f16f139c31ed93bc6e536af3a957ab5&X-Amz-SignedHeaders=host&actor_id=983004&key_id=0&repo_id=666283370" width="400"/></a>

## Key Features
- **Selecting words**: I implemented a custom hook that uses PointerEvents.
- **Swapping letters**: I used React DnD (a popular drag-and-drop library) to implement letter swapping. Swapping works with touch and mouse interaction.
- **Real-time multiplayer**: players interact with the same board using pub-sub messaging client Ably
- **Lobby**: players can start a game or join an existing game

## Tools I Used
- React
- Typescript
- Redis DB for storing game state, rooms, and dictionary
- Tanstack / React Query
- T3: Next.js, tRPC, Tailwind CSS
- Some Material UI components

Although I've implemented the foundations, the game is a work-in-progress. I'm now working on game design - coming up with constraints that make an engaging multiplayer experience.
