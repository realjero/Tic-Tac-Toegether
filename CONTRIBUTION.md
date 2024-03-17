# Tic Tac Together

`Mert Ali Özmeral, Sebastian Adam Heinrich Knauf, Eike Torben Menzel & Jerome-Pascal Habanz`

## Getting started

### Local Development
To begin local development, follow these steps for both the _./app/backend_ and _./app/frontend_ directories:

1. **Install dependencies by running the command in** _./app/backend_ **and** _./app/frontend_ **directory:**
```bash
npm i
```

2. **For the frontend, navigate to the** _./app/frontend_ **directory and initiate the build process with live updates:**
```bash
npm run build -- --watch
```

3. **Open another shell window and proceed to the** _./app/backend_ **directory:**
4. **Start the backend server in development mode:**
```bash
npm run start:dev
```
Now TicTacToegether should be up and running on http://localhost:3000

### Local Production

To begin local production, follow these steps for both the _./app/backend_ and _./app/frontend_ directories:

1. **Install dependencies by running the command in** _./app/backend_ **and** _./app/frontend_ **directory:**
```bash
npm i
```

2. **For the frontend, navigate to the** _./app/frontend_ **directory and initiate the build process:**
```bash
npm run build
```

3. **Proceed to the** _./app/backend_ **directory:**
4. **Start the backend server in production mode:**
```bash
npm run build
npm run start:prod
```
Now TicTacToegether should be up and running on http://localhost:3000

