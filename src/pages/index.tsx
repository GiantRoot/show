import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/metal_powder/intro">
            实验原料及技术介绍 🧪
          </Link>
          <>  &nbsp; &nbsp; &nbsp;</>
          <Link
            className="button button--secondary button--lg"
            to="/metal_powder/intro">
            快速生成一个渲染模型 ⏱️
          </Link>
          <>  &nbsp; &nbsp; &nbsp;</>
          <Link
            className="button button--secondary button--lg"
            to="/metal_powder/intro">
            捐赠本站  ❤️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="实验科学与虚拟模型的交响">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
