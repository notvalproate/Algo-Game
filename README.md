# Algo-Game

Algo-Game is a web-app project that brings the Japanese card game Algo Basic to a digital platform, allowing players to engage in multiplayer matches. Players can enter a unique room key and username to join a lobby and start playing against each other.


## Prerequisites:

- [Node.js](https://nodejs.org/) installed


# Installation:

- Install the packages using npm:
```bash
npm install
```
- Create a .env file and specify the variables as given in the .env.example file:

### UNIX
```bash
touch .env
```
### Windows
```
notepad .env
```
# Build
- To compile scss in watch mode:
```bash
npm run sass-dev
```

- To build the static files with webpack:
```bash
npm run build
```
The built files are generated and output in the dist folder in the root directory. The contents can be moved into the public/prod folder to serve the newly built files.
# Run the server:
```bash
npm run dev
```
The above command runs the server with concurrently compiling sass to css. To run the server without concurrently compiling scss:
```bash
npm run devstart
```

# License

This project is licensed under the [GNU GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
