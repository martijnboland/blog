const url = require('url');

async function legacyredirect(context, req) {
  const originalUrl = req.headers['x-ms-original-url'];
  if (originalUrl) {
    // This URL has been proxied as there was no static file matching it.
    context.log(`x-ms-original-url: ${originalUrl}`);

    const parsedURL = url.parse(originalUrl);

    // Check if the route has the /martijn/{yyyy}/{mm}/{dd}/{slug} path. If so,
    // redirect permanently to /martijn/posts/slug
    const oldUrlPattern = /^\/martijn\/\d{4}\/\d{2}\/\d{2}\/([a-zA-Z0-9-]+)\/?$/
    const match = parsedURL.pathname.match(oldUrlPattern);
    if (match) {
      const slug = match[1];
      context.res = {
        status: 301,
        headers: {
          location: `/martijn/posts/${slug}`
        }
      };
      return;
    }

    // Check if the route has the /martijn/tag/{tag} path. If so, redirect permanently to /martijn/tags/{tag}
    const tagsUrlPattern = /^\/martijn\/tag\/([a-zA-Z0-9-]+)\/?$/
    const tagMatch = parsedURL.pathname.match(tagsUrlPattern);
    if (tagMatch) {
      const tag = tagMatch[1];
      context.res = {
        status: 301,
        headers: {
          location: `/martijn/tags/${tag}`
        }
      }
      return;
    }

    // Check if the route has the /martijn/category/{category} path. If so, redirect permanently to /martijn
    const categoryUrlPattern = /^\/martijn\/category\/([a-zA-Z0-9-]+)\/?$/
    const categoryMatch = parsedURL.pathname.match(categoryUrlPattern);
    if (categoryMatch) {
      context.res = {
        status: 301,
        headers: {
          location: `/martijn`
        }
      }
      return;
    }
 }

  context.log(
    `No explicit redirect for ${originalUrl} so will redirect to 404`,
  );

  context.res = {
    status: 302,
    headers: {
      location: originalUrl
        ? `/martijn/404.html?originalUrl=${encodeURIComponent(originalUrl)}`
        : '/martijn/404.html',
    },
  };
};

module.exports = legacyredirect;