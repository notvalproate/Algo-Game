# Setup 

Follow The Steps below to get started with running Algo Basic on your local machine to start developing and contributing.

## Prerequisites
- [Node.js](https://nodejs.org/) installed

# Installation:

1. Install the packages using npm:
```bash
npm i
```
2. Create a .env file and specify the variables as given in the .env.example file:
- On UNIX
```bash
touch .env
```
- On Windows
```
notepad .env
```
# Node Scripts
Run a specific node script by typing:
```
npm run script-name
```
where 'script-name' is the name of the script. e.g.
```
npm run sass-dev
```

## Available Scripts
- build
  - Runs webpack to compile the scss and javascript into the output folder specified in the webpack.config.js file. Needed only for building the production files.
- start
  - Runs 'node server.js' and runs the server normally.
- devstart
  - Runs the server using nodemon. Constantly watches for updates/changes in code and restarts the server when needed.
- sass-dev
  - Runs the Sass compiler in watch mode. Can be used in combination with devstart to make style changes live.
- **dev**
  - The main script you will be using in your development process. Runs both devstart and sass-dev concurrently, making server restarts automatically while also compiling sass on the fly.
# Adding New Sass
1. To add new Sass files, add a new file as partial in the [public/dev/scss/partials](https://github.com/notvalproate/Algo-Game/tree/main/public/dev/scss/partials) folder where the filename starts with an underscore '_'
2. Go to the [public/dev/scss/styles.scss](https://github.com/notvalproate/Algo-Game/tree/main/public/dev/scss/styles.scss) file and import your partial in it so it directly gets compiled to the output styles.css file.
# Running the Server
1. Run the server using: 
```
npm run dev
```
2. Open your browser and go to the link output in the console to open the website. e.g. if the PORT given was 3000, go to http://localhost:3000/
3. To view css or js changes after any changes made to the scss files, reload the page.
## Links
- [CONTRIBUTING.md](https://github.com/notvalproate/Algo-Game/blob/main/CONTRIBUTING.md)
- [README.md](https://github.com/notvalproate/Algo-Game/blob/main/README.md)
