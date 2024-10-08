import express from "express";
import { createSSRApp, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { initializeNodeRuntime } from "@builder.io/sdk-vue/node/init";
import { fetchOneEntry, isPreviewing, Content } from "@builder.io/sdk-vue";

initializeNodeRuntime();

const apiKey = "ad30f9a246614faaa6a03374f83554c9";
const model = "page";

const server = express();

server.get("*", async (req, res) => {
  // Fetch Builder.io content based on the URL path from the request
  const content = await fetchOneEntry({
    model,
    apiKey,
    userAttributes: {
      urlPath: "/data-symbols",
    },
  });

  const canShowContent = content ? true : isPreviewing();

  const app = createSSRApp({
    setup() {
      const builderContent = ref(content);

      return {
        model,
        apiKey,
        builderContent,
        canShowContent,
      };
    },
    template: `
      <Content
        v-if="canShowContent"
        :model="model"
        :content="builderContent"
        :api-key="apiKey"
      />
      <div v-else>Content not Found</div>
    `,
    components: {
      Content,
    },
  });

  const html = await renderToString(app);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vue SSR with Builder.io</title>
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
