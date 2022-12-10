# Explosive-Chess-Game-refactored

Explosive Chess is a game that lets the player choose between a fierce duel or sacrificing the piece in an explosion, <a href="https://tiny-dango-495eb4.netlify.app/"> Play It!</a>

After studying OOP and the book Design Patterns, I remade the game again.
This time, I filtered the ilegal moves separatedly from the function we get them, looking for the SRP/OCP and changing the algorithm for each piece (kinda like Strategy Pattern). Also, stopped my bad practice of commenting and tried to write a clean and cohesive code. There's no inheritance at all and pieces are components of a player which is a component of gameboard. I've also tried to do MVC (this time knowing what It's supposed to be like), which made the code very readable (at least for me). Even if the code may not be 100%, I'm very proud of having pushed myself to try to make It better. 

Ideas to improve the code:
- Divide MVC into folders, dividing the file into other files in a modular manner.
- Make the end overlay a bit more responsive. 
- Make the game acessible for screen readers

Ideas to improve the project:
- Make animations on placing pieces, holding the piece...
- Adding an enemy with minimax algorithm
- Making It multiplayer (quite a challenge, I suppose) 
