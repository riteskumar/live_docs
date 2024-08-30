import { Liveblocks } from "@liveblocks/node";

export const liveblocks = new Liveblocks({
    // secret: "sk_dev_oDBB3ICdFW4A_yi_jAZjz9T69iA7ImQZOPlFY8tJ6B2zw3GhidJiI1LgIjAuGtbU",
    secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
  });