import {
  type Context as ContextT,
  type FunctionComponent,
  type ReactNode,
  createContext,
  useMemo,
} from 'react';

import Helmet from './Helmet';

type PropsT = {
  children?: ReactNode;
  description: string;
  extraMetaTags?: Array<{
    content: string;
    name: string;
  }>;
  image?: string;
  siteName?: string;
  socialDescription?: string;
  socialTitle?: string;
  title: string;
  url?: string;
};

const Context = createContext<PropsT>({
  description: '',
  title: '',
});

/**
 * Auxiliary wrapper around "react-helmet", which helps to inject meta tags
 * (page title, a brief content description, and social media thumbnails) into
 * generated pages.
 */
const MetaTags: FunctionComponent<PropsT> & {
  Context: ContextT<PropsT>;
} = ({
  children,
  description,
  extraMetaTags,
  image,
  siteName,
  socialDescription,
  socialTitle,
  title,
  url,
}) => {
  // NOTE: I guess, in this very case, we should prefer title and description
  // also to empty social title and decscription?
  /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
  const socTitle = socialTitle || title;
  const socDesc = socialDescription || description;
  /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

  const context = useMemo(() => ({
    description,
    image,
    siteName,
    socialDescription,
    socialTitle,
    title,
    url,
  }), [
    description,
    image,
    siteName,
    socialDescription,
    socialTitle,
    title,
    url,
  ]);

  const extra: ReactNode[] = [];
  if (extraMetaTags?.length) {
    for (let i = 0; i < extraMetaTags.length; ++i) {
      const { content, name } = extraMetaTags[i]!;
      extra.push(
        <meta
          content={content}
          key={`extra-meta-tag-${i}`}
          name={name}
        />,
      );
    }
  }

  return (
    <>
      <Helmet>
        {/* General tags. */}
        <title>
          {title}
        </title>
        <meta content={description} name="description" />

        {/* Twitter cards. */}
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={socTitle} name="twitter:title" />
        <meta content={socDesc} name="twitter:description" />
        { image ? <meta content={image} name="twitter:image" /> : null }
        {
          siteName
            ? <meta content={`@${siteName}`} name="twitter:site" />
            : null
        }

        {/* Open Graph data. */}
        <meta content={socTitle} name="og:title" />
        { image ? <meta content={image} name="og:image" /> : null }
        { image ? <meta content={socTitle} name="og:image:alt" /> : null }
        <meta content={socDesc} name="og:description" />
        {
          siteName ? <meta content={siteName} name="og:sitename" /> : null
        }
        { url ? <meta content={url} name="og:url" /> : null }
        {extra}
      </Helmet>
      {
        children ? (
          <Context value={context}>
            {children}
          </Context>
        ) : null
      }
    </>
  );
};

MetaTags.Context = Context;

export default MetaTags;
