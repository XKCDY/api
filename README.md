# TypeScript Package Template

**Note**: I really wanted to use [Vapor](https://github.com/vapor/vapor/) as XKCDY's backend, but unfortunately [Fluent](https://github.com/vapor/fluent-kit) seems to have significant performance issues with eager loading. The same dataset of all comics took between 6 - 9 seconds to return from start to finish with Vapor, whereas the Express version does the same thing in under 200 ms.
