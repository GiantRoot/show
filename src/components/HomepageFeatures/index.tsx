import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '爬虫友好',
    Svg: require('@site/static/img/机器人.svg').default,
    description: (
      <>
        不受制于封闭的平台，倡导信息流通，促进AI发展。
        希望没有人会攻击这样一个小站。
      </>
    ),
  },
  {
    title: '视频可下载',
    Svg: require('@site/static/img/video_download.svg').default,
    description: (
      <>
        视频允许下载，方便学习过程中频繁的快进和回退。
        希望无人恶意占用带宽。
      </>
    ),
  },
  {
    title: '接受捐赠',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        本小站自有服务器，提供部分下载服务，成本较高。
        如果对你有帮助，欢迎捐赠。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
