# React Helmet

[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-helmet.svg)](https://www.npmjs.com/package/@dr.pogodin/react-helmet)
[![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-helmet.svg)](https://www.npmjs.com/package/@dr.pogodin/react-helmet)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/birdofpreyru/react-helmet/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/birdofpreyru/react-helmet)
[![GitHub repo stars](https://img.shields.io/github/stars/birdofpreyru/react-helmet?style=social)](https://github.com/birdofpreyru/react-helmet)
[![Dr. Pogodin Studio](https://raw.githubusercontent.com/birdofpreyru/react-helmet/master/.README/logo-dr-pogodin-studio.svg)](https://dr.pogodin.studio/docs/react-helmet)

---
_This is a fork of https://github.com/staylor/react-helmet-async library, which in turns is a fork & upgrade of https://github.com/nfl/react-helmet. The purpose of this fork is to ensure proper maintenance and further development of the library._

_This fork is published to NPM as https://www.npmjs.com/package/@dr.pogodin/react-helmet, its version 2.0.4 exactly matches the same version of the forked library, but with React peer dependency version set to 19. Future versions will take care of an update of dependencies, and code upgrades to the latest React best practices._

[![Sponsor](https://raw.githubusercontent.com/birdofpreyru/js-utils/master/.README/sponsor.svg)](https://github.com/sponsors/birdofpreyru)
---

[Announcement post on Times Open blog](https://open.nytimes.com/the-future-of-meta-tag-management-for-modern-react-development-ec26a7dc9183)

This package is a fork of [React Helmet](https://github.com/nfl/react-helmet).
`<Helmet>` usage is synonymous, but server and client now requires `<HelmetProvider>` to encapsulate state per request.

`react-helmet` relies on `react-side-effect`, which is not thread-safe. If you are doing anything asynchronous on the server, you need Helmet to encapsulate data on a per-request basis, this package does just that.

## Usage

**New is 1.0.0:** No more default export! `import { Helmet } from '@dr.pogodin/react-helmet'`

The main way that this package differs from `react-helmet` is that it requires using a Provider to encapsulate Helmet state for your React tree. If you use libraries like Redux or Apollo, you are already familiar with this paradigm:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Helmet, HelmetProvider } from '@dr.pogodin/react-helmet';

const app = (
  <HelmetProvider>
    <App>
      <Helmet>
        <title>Hello World</title>
        <link rel="canonical" href="https://www.tacobell.com/" />
      </Helmet>
      <h1>Hello World</h1>
    </App>
  </HelmetProvider>
);

ReactDOM.hydrate(
  app,
  document.getElementById(‘app’)
);
```

On the server, we will no longer use static methods to extract state. `react-side-effect`
exposed a `.rewind()` method, which Helmet used when calling `Helmet.renderStatic()`. Instead, we are going
to pass a `context` prop to `HelmetProvider`, which will hold our state specific to each request.

```javascript
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Helmet, HelmetProvider } from '@dr.pogodin/react-helmet';

const helmetContext = {};

const app = (
  <HelmetProvider context={helmetContext}>
    <App>
      <Helmet>
        <title>Hello World</title>
        <link rel="canonical" href="https://www.tacobell.com/" />
      </Helmet>
      <h1>Hello World</h1>
    </App>
  </HelmetProvider>
);

const html = renderToString(app);

const { helmet } = helmetContext;

// helmet.title.toString() etc…
```

## Streams

This package only works with streaming if your `<head>` data is output outside of `renderToNodeStream()`.
This is possible if your data hydration method already parses your React tree. Example:

```javascript
import through from 'through';
import { renderToNodeStream } from 'react-dom/server';
import { getDataFromTree } from 'react-apollo';
import { Helmet, HelmetProvider } from '@dr.pogodin/react-helmet';
import template from 'server/template';

const helmetContext = {};

const app = (
  <HelmetProvider context={helmetContext}>
    <App>
      <Helmet>
        <title>Hello World</title>
        <link rel="canonical" href="https://www.tacobell.com/" />
      </Helmet>
      <h1>Hello World</h1>
    </App>
  </HelmetProvider>
);

await getDataFromTree(app);

const [header, footer] = template({
  helmet: helmetContext.helmet,
});

res.status(200);
res.write(header);
renderToNodeStream(app)
  .pipe(
    through(
      function write(data) {
        this.queue(data);
      },
      function end() {
        this.queue(footer);
        this.queue(null);
      }
    )
  )
  .pipe(res);
```

## Usage in Jest
While testing in using jest, if there is a need to emulate SSR, the following string is required to have the test behave the way they are expected to.

```javascript
import { HelmetProvider } from '@dr.pogodin/react-helmet';

HelmetProvider.canUseDOM = false;
```

## Prioritizing tags for SEO

It is understood that in some cases for SEO, certain tags should appear earlier in the HEAD. Using the `prioritizeSeoTags` flag on any `<Helmet>` component allows the server render of @dr.pogodin/react-helmet to expose a method for prioritizing relevant SEO tags.

In the component:
```javascript
<Helmet prioritizeSeoTags>
  <title>A fancy webpage</title>
  <link rel="notImportant" href="https://www.chipotle.com" />
  <meta name="whatever" value="notImportant" />
  <link rel="canonical" href="https://www.tacobell.com" />
  <meta property="og:title" content="A very important title"/>
</Helmet>
```

In your server template:

```javascript
<html>
  <head>
    ${helmet.title.toString()}
    ${helmet.priority.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${helmet.script.toString()}
  </head>
  ...
</html>
```

Will result in:

```html
<html>
  <head>
    <title>A fancy webpage</title>
    <meta property="og:title" content="A very important title"/>
    <link rel="canonical" href="https://www.tacobell.com" />
    <meta name="whatever" value="notImportant" />
    <link rel="notImportant" href="https://www.chipotle.com" />
  </head>
  ...
</html>
```

A list of prioritized tags and attributes can be found in [constants.ts](./src/constants.ts).

## Usage without Context
You can optionally use `<Helmet>` outside a context by manually creating a stateful `HelmetData` instance, and passing that stateful object to each `<Helmet>` instance:


```js
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Helmet, HelmetProvider, HelmetData } from '@dr.pogodin/react-helmet';

const helmetData = new HelmetData({});

const app = (
    <App>
      <Helmet helmetData={helmetData}>
        <title>Hello World</title>
        <link rel="canonical" href="https://www.tacobell.com/" />
      </Helmet>
      <h1>Hello World</h1>
    </App>
);

const html = renderToString(app);

const { helmet } = helmetData.context;
```
