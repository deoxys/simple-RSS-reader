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

# In a seperate terminal run to start a scheduled runner to fetch the items in the feeds every 5 min. 
npm run schedule:run

```

# Feeds

Adding a new feed can be done on the settings page in the card titled `Feeds`. If the given url is a correct XML RSS scheme the data will be inserted in the database and the articles will be fetched. When you delete a feed, it and all its related articles will be removed from the database.


# Articles

Once one or more feeds have been added their articles will show up on the main page. These can be filtered with keywords that can be added / removed on the settings page. Adding keywords will hide articles containing that keyword on the main page. If you no longer want to filter based on a specific keyword you can choose to delete that keyword and articles containing that keyword will no longer be hidden. You can add filter keywords to filter on the `Title`, `Content` (Description) or `Category` of the RSS Item. Please note that `Category` is not always used by every RSS provider.
