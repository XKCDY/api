# XKCDY / api

This is the backend API for [XKCDY](https://xkcdy.com).

**Note**: I really wanted to use [Vapor](https://github.com/vapor/vapor/) as XKCDY's backend, but unfortunately [Fluent](https://github.com/vapor/fluent-kit) seems to have significant performance issues with eager loading. The same dataset of all comics (loading with attached image rows) took between 6 - 9 seconds to return from start to finish with Vapor, whereas the Express version does the same thing in under 200 ms.

Docs can be found [here](https://api.xkcdy.com/docs/).

### Packages & Technologies

- [typescript-rest](https://www.npmjs.com/package/typescript-rest)
- [Express](http://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Dokku](https://github.com/dokku/dokku) (deployment)
- [Cloudflare](https://www.cloudflare.com/) (caching)
