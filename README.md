# React Helmet

[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-helmet.svg)](https://www.npmjs.com/package/@dr.pogodin/react-helmet)
[![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-helmet.svg)](https://www.npmjs.com/package/@dr.pogodin/react-helmet)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/birdofpreyru/react-helmet/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/birdofpreyru/react-helmet)
[![GitHub repo stars](https://img.shields.io/github/stars/birdofpreyru/react-helmet?style=social)](https://github.com/birdofpreyru/react-helmet)
[![Dr. Pogodin Studio](https://raw.githubusercontent.com/birdofpreyru/react-helmet/master/.README/logo-dr-pogodin-studio.svg)](https://dr.pogodin.studio/docs/react-helmet)

Advanced management of document head's elements (`<base>`, `<link>`, `<meta>`,
`<noscript>`, `<script>`, `<style>`, `<title>`), and of attributes of `<body>`
and `<html>` elements in React 19+ applications. This library is a proud
successor of now unmaintained and stale
[react-helmet-async](https://github.com/staylor/react-helmet-async) and
[react-helmet](https://github.com/nfl/react-helmet) libraries.

[![Sponsor](https://raw.githubusercontent.com/birdofpreyru/js-utils/master/.README/sponsor.svg)](https://github.com/sponsors/birdofpreyru)

### Sponsored By
[<img width=36 src="https://avatars.githubusercontent.com/u/17030877?v=4&s=36" />](https://github.com/RigoOnRails)

### [Contributors](https://github.com/birdofpreyru/react-helmet/graphs/contributors)
[<img width=36 src="https://avatars.githubusercontent.com/u/20144632?s=36" />](https://github.com/birdofpreyru)

## Table of Contents
- [Getting Started]
- [Prioritizing Tags for SEO]
- [Reference]
  - [Helmet] &mdash; specifies elements and attributes to be created / set /
    overriden.
  - [HelmetDataContext] &mdash; context object for server-side rendering (SSR)
    purposes.
  - [HelmetProvider] &mdash; provides [React Context] to [Helmet] components.
  - [MetaTags] &mdash; helper component for easier rendering of page title,
    description, and meta-data for search engines, and social graphs (_i.e._
    previews of linked pages in social networks, messengers, _etc._).

## Getting Started
[Getting Started]: #getting-started

To install the library:
```sh
npm install --save @dr.pogodin/react-helmet
```

At a high level, wrap the main application tree into [HelmetProvider]:
```tsx
import type { FunctionComponent } from 'react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';

const YourApp: FunctionComponent = () => {
  /* Whatever code you need. */
  return (
    <HelmetProvider>
      { /* Your application tree. */ }
    </HelmetProvider>
  );
}
```

Anywhere within the [HelmetProvider]'s children tree use [Helmet] component
to set / modify document head's elements, or supported attributes of `<body>`
and `<html>` elements. Instances of [Helmet] component within the application
tree add or override elements and attributes in the order these [Helmet]
instances are rendered.
```tsx
import type { FunctionComponent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

const SomeComponent: FunctionComponent = () => {
  /* Whatever code you need. */
  return (
    <div>
      <Helmet>
        <title>My Title</title>
        <link rel="canonical" href="http://mysite.com/example" />
        <meta charSet="utf-8" />
        <meta name="description" content="Some Component" />
      </Helmet>
      { /* Whatever other stuff you need. */ }

      { /* For example, this other <Helmet> component will override the title
           and description set earlier in the render tree. */ }
      <Helmet>
        <title>Overriden Title</title>
        <meta name="description" content="Overriden Component Description" />
      </Helmet>
    </div>
  )
};
```

Alternatively, all elements and attributes specified by [Helmet] components may
be provided _via_ props instead of children.
```tsx
import type { FunctionComponent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

const SomeComponent: FunctionComponent = () => {
  /* Whatever code you need. */
  return (
    <div>
      <Helmet
        title="My Title"
        link={[{
          href: 'http://mysite.com/example',
          rel: 'canonical',
        }]}
        meta={[{
          charSet: 'utf-8',
        }, {
          content: 'Some Component',
          name: 'description',
        }]}
      />
      { /* Whatever other stuff you need. */ }

      { /* For example, this other <Helmet> component will override the title
           and description set earlier in the render tree. It is also fine to
           use a mix of props and children. */ }
      <Helmet title="Overriden Title">
        <meta name="description" content="Overriden Component Description" />
      </Helmet>
    </div>
  )
};
```

For the server-side rendering purposes you pass in a `context` object to
the [HelmetProvider], and after the render you use that object to retrieve
the string, or component representation of the elements and attributes to be
injected into the document head (if you use streaming for server side rendering
you should output your `<head>` data outside `renderToNodeStream()`):
```tsx
import type { FunctionComponent } from 'react';
import { type HelmetDataContext, HelmetProvider } from '@dr.pogodin/react-helmet';

async function yourServerSideRenderingFunction() {
  // ...
  const context: HelmetDataContext = {};
  const { prelude } = await prerenderToNodeStream(
    <HelmetProvider context={context}>
      { /* Your application tree. */ }
    </HelmetProvider>
  );
  // ...

  // For example, this is how you get the string representation of <meta> tags
  // to be injected into your document head.
  const metaElements = context.helmet.meta?.toString();
}
```

## Prioritizing Tags for SEO
[Prioritizing Tags for SEO]: #prioritizing-tags-for-seo

It is understood that in some cases for SEO, certain tags should appear earlier
in the HEAD. Using the `prioritizeSeoTags` flag on any `<Helmet>` component
allows the server render of @dr.pogodin/react-helmet to expose a method for
prioritizing relevant SEO tags.

In the component:
```tsx
<Helmet prioritizeSeoTags>
  <title>A fancy webpage</title>
  <link rel="notImportant" href="https://www.chipotle.com" />
  <meta name="whatever" value="notImportant" />
  <link rel="canonical" href="https://www.tacobell.com" />
  <meta property="og:title" content="A very important title"/>
</Helmet>
```

In your server template:
```tsx
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

A list of prioritized tags and attributes (`SEO_PRIORITY_TAGS`) can be found in
[constants.ts](./src/constants.ts).

## Reference
[Reference]: #reference

### Helmet
[Helmet]: #helmet

The [Helmet] component specifies (document head) elements and attributes to be
created / set / overriden by the library. Different [Helmet] instances within
the application tree (within the single [HelmetProvider]) have effect in the
order they are encountered (mounted to DOM) during the render.

The [Helmet] component exposes two equivalent APIs &mdash; the elements /
attributes may be provided either as component's children (_i.e._ written as
regular JSX component children), or as [Helmet] component props. Both these
APIs can also be used at the same time, with values provided as props handled
as additional JSX children, appearing prior the explicitly provided JSX children.

**Props**
- `base` &mdash; _To be documented_

- `bodyAttributes` &mdash; _To be documented_

- `defaultTitle` &mdash; **string** | **undefined** &mdash; Optional.
  The fallback to use when `titleTemplate` (below) prop is provided,
  but no title was specified:
  ```tsx
  // JSX code:
  <Helmet
    defaultTitle="My Site"
    titleTemplate"My Site - %s"
  />

  // DOM output:
  <head>
    <title>My Site</title>
  </head>
  ```

- `defer` &mdash; **boolean** | **undefined** &mdash; Optional. Defaults _true_.
  set to _false_ to not use `requestAnimationFrame` and instead update the DOM
  as soon as possible. Useful if you want to update the title when the tab is
  out of focus.

- `encodeSpecialCharacters` &mdash; **boolean** | **undefined** &mdash;
  Optional. Defaults _true_. Set _false_ to disable string encoding by
  `.toString()` methods of [HelmetDataContext].

- `htmlAttributes` &mdash; _To be documented_

- `link` &mdash; _To be documented_

- `meta` &mdash; _To be documented_

- `noscript` &mdash; _To be documented_

- `onChangeClientState` &mdash; **function** | **undefined** &mdash; Optional.
  A callback to trigger on client-side each time the head elements / attributes
  are updated. It will be called with three arguments:
  - `newState` &mdash; _To be documented_
  - `addedTags` &mdash; _To be documented_
  - `removedTags` &mdash; _To be documented_

- `prioritizeSeoTags` &mdash; _To be documented_

- `script` &mdash; _To be documented_

- `style` &mdash; _To be documented_

- `title` &mdash; _To be documented_

- `titleAttributes` &mdash; _To be documented_

- `titleTemplate` &mdash; **string** | **undefined** &mdash; Optional.
  Allows to inherit title from a template, _e.g._
  ```tsx
  // JSX code:
  <Helmet titleTemplate="%s | MyAwesomeWebsite.com">
    <title>Nested Title</title>
  </Helmet>

  // DOM output:
  <head>
    <title>Nested Title | MyAwesomeWebsite.com</title>
  </head>
  ```

**Children**

```tsx
<Helmet>
    {/* html attributes */}
    <html lang="en" amp />

    {/* body attributes */}
    <body className="root" />

    {/* title attributes and value */}
    <title itemProp="name" lang="en">My Plain Title or {`dynamic`} title</title>

    {/* base element */}
    <base target="_blank" href="http://mysite.com/" />

    {/* multiple meta elements */}
    <meta name="description" content="Helmet application" />
    <meta property="og:type" content="article" />

    {/* multiple link elements */}
    <link rel="canonical" href="http://mysite.com/example" />
    <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-57x57.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="http://mysite.com/img/apple-touch-icon-72x72.png" />
    {locales.map((locale) => {
        <link rel="alternate" href="http://example.com/{locale}" hrefLang={locale} key={locale}/>
    })}

    {/* multiple script elements */}
    <script src="http://include.com/pathtojs.js" type="text/javascript" />

    {/* inline script elements */}
    <script type="application/ld+json">{`
        {
            "@context": "http://schema.org"
        }
    `}</script>

    {/* noscript elements */}
    <noscript>{`
        <link rel="stylesheet" type="text/css" href="foo.css" />
    `}</noscript>

    {/* inline style elements */}
    <style type="text/css">{`
        body {
            background-color: blue;
        }

        p {
            font-size: 12px;
        }
    `}</style>
</Helmet>
```

### HelmetDataContext
[HelmetDataContext]: #helmetdatacontext

The [HelmetDataContext] (it may be initialized as just an empty object) can be
provided to [HelmetProvider] for server-side rendering (SSR) purposes. After
the component tree has been rendered, the `helmet` field will be attached to
this context:
```tsx
type HelmetDataContext = {
  helmet?: {
    base: HelmetDatum;
    bodyAttributes: HelmetDatum;
    htmlAttributes: HelmetDatum;
    link: HelmetDatum;
    meta: HelmetDatum;
    noscript: HelmetDatum;
    script: HelmetDatum;
    style: HelmetDatum;
    title: HelmetDatum;
    titleAttributes?: HelmetDatum;
    priority: HelmetDatum;
  };
};

// where each HelmetDatum has two methods allowing to get string and component
// representations of the corresponding elements or attrbiutes:
type HelmetDatum = {
  toString(): string;
  toComponent(): ReactNode;
};
```

### HelmetProvider
[HelmetProvider]: #helmetprovider

The [HelmetProvider] component provides [React Context] to [Helmet]
components, _i.e._ any [Helmet] components in the application tree must be
descendants of a single [HelmetProvider] instance.

**Props**
- `children` &mdash; **ReactNode** &mdash; The component tree to render in
  the place of [HelmetProvider].
- `context` &mdash; [HelmetDataContext] | **undefined** &mdash; Optional.
  A user-provided context object for server-side rendering (SSR) purposes.

### MetaTags
[MetaTags]: #metatags
The [MetaTags] component is a helper for easier rendering of page title,
description, and misc meta tags for search engines and social graphs (_i.e._ for
previews of linked pages in social media, messengers, _etc._). Based on provided
properties it uses [Helmet] to render:
- `<title>` and `<meta name="description">` tags.
- Meta tags for [Open Graph].
- Meta tags for [Twitter (X) Cards].

```tsx
// Simple Example.

import type { FunctionComponent } from 'react';
import { MetaTags } from '@dr.pogodin/react-helmet';

const Example: FunctionComponent = () => (
  <MetaTags
    description="Example page description"
    title="Example page title"
  />
);

// It is completely equivalent to:

import type { FunctionComponent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

const EquivalentComponent: FunctionComponent = () => (
  <Helmet>
    <title>Example page title</title>
    <meta content="Example page description" name="description" />

    <meta content="summary_large_image" name="twitter:card" />
    <meta content="Example page title" name="twitter:title" />
    <meta content="Example page description" name="twitter:description" />

    <meta content="Example page title" name="og:title" />
    <meta content="Example page description" name="og:description" />
  </Helmet>
);
```
As this example demonstrates, [MetaTags] must not be wrapped into [Helmet],
as it will render its instance itself, but the same as [Helmet] components,
all [MetaTags] instances should be descendants of [HelmetProvider] within
the application component tree.

Multiple [MetaTags] within the application tree override the tags they manage
according to the usual [Helmet] logic.

**Required Properties**:

- `description` &mdash; **string** &mdash; Page description to use in
  the _description_ meta tag, and as the default description in [Open Graph]
  and [Twitter (X) Cards].

- `title` &mdash; **string** &mdash; The page name to use in the `<title>` tag,
  and as the default title in [Open Graph] and [Twitter (X) Cards].

**Optional Properties**:

- `children` &mdash; **ReactNode** &mdash; Component children, if any,
  are rendered at the component's place.

  All meta data injected by [MetaTags] instance are passed down the children
  tree using an auxiliary context, thus facilitating tags modification
  by children. For example:

  ```tsx
  import { type FunctionComponent, use } from 'react';
  import { MetaTags } from '@dr.pogodin/react-helmet';

  const Child: FunctionComponent = () => {
    // These are values injected by parent <MetaTags> component, if any.
    const { title, description, ...rest } = use(MetaTags.Context);

    // Say, you may modify the "parent" title like this:
    return <MetaTags title={`${title} / Child Component`} />;
  };

  const Parent: FunctionComponent = () => (
    <MetaTags title="Parent Component">
      <Child />
    </MetaTags>
  );
  ```

- `extraMetaTags` &mdash; **Array&lt;\{ content: string; name: string \}&gt;**
  &mdash; Allows to add additional, arbitrary `<meta>` tags to the page, with
  given `content` and `name` strings.

- `image` &mdash; **string** &mdash; The absolute URL of thumbnail image to use
  in [Open Graph] and [Twitter (X) Cards] meta tags (`twitter:image`,
  and `og:image`). By default these tags are not injected.

  **BEWARE:** The value must be a complete, absolute URL, including the correct
  website domain and HTTP schema.

- `siteName` &mdash; **string** &mdash; The site name to use in `twitter:site`,
  and `og:sitename` meta tags. By default these tags are not injected.

- `socialDescription` &mdash; **string** &mdash; The site description to use in
  `twitter:description` and `og:description` meta tags. By default the value of
  `description` prop is used.

- `socialTitle` &mdash; **string** &mdash; The page title to use in `twitter:title`,
  `og:title`, and `og:image:alt` meta tags. By default the value of `title` prop
  is used. Also the `og:image:alt` tag is only injected if `image` prop
  is present.

- `url` &mdash; **string** &mdash; The page URL to use in `og:url` meta tag.
  By default the tag is not injected.

[Open Graph]: https://ogp.me
[React Context]: https://react.dev/learn/passing-data-deeply-with-context
[Twitter (X) Cards]: https://developer.x.com/en/docs/x-for-websites/cards/overview/abouts-cards
