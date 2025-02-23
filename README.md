This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

I was slightly dissapointed in the theming of existing solutions so I made my own small rss reader for self hosting. This is still a work in progress which I will continue working on when I feel like coding in my free time.

## Getting Started

Make sure the environment variables are initialized in a `.env` file. Afterwards run the following commands:
```bash
# Install required npm packages
npm install

# Start up the postgres container
docker compose up -d

# Run the prisma migrations to initialize the database
npx prisma migrate dev

# Run the dev nextjs server
npm run dev

```

Currently adding a new feed requires sending a POST request to `http://localhost:3000/api/rss/addChannel` with the following body:
```json
{
    "feedLink": "https://feeds.nos.nl/nosnieuwsalgemeen"
}
```
where the feedLink can by any url that points to a rss schema.

Retrieving / updating the items from the feed can be done by sending a GET request to `http://localhost:3000/api/rss/fetchFeeds` or starting up the bullmq scheduler: `npm run schedule:run`.

Once that is done visit http://localhost:3000/ to see the items from the feed.
