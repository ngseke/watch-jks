# Watch JKS

👀 🐟

<img width="984" alt="demo" src="https://user-images.githubusercontent.com/17077760/229779512-86eeb856-100b-4795-8cea-4fdbd13768e8.png">

## Run

```bash
cp .env.example .env
pnpm i
pnpm run dev
```

## Set up the bot

Create your new bot with [BotFather](https://t.me/BotFather)

```
/newbot
```

```
/setcommands
```

```
start - 🐟 Say hello
showrecent - 👀 Show recent products
subscribe - 🔔 Subscribe the bot
unsubscribe - 🔕 Unsubscribe the bot
```

## Build Docker Image

```bash
docker build -t watch-jks .
```

## Run Docker Container

```bash
docker run --env-file .env -- watch-jks
```
