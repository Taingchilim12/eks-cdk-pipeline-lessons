import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const lessons = [
  {title: 'Architecture', to: '/architecture', desc: 'Pipeline → infra stage → stacks, and how they connect to ArgoCD.'},
  {title: 'GitFlow Workflow', to: '/gitflow-workflow', desc: 'How feature/develop/release/main map onto environments.'},
  {title: 'Deployment Walkthrough', to: '/deployment-walkthrough', desc: 'Step-by-step, from npm ci to a running cluster.'},
  {title: 'Karpenter', to: '/karpenter', desc: 'IAM, SQS interruption handling, and the default NodePool.'},
];

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
          <Link className="button button--secondary button--lg" to="/intro">
            Start the lesson →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <section className={styles.lessonGrid}>
          <div className="container">
            <div className="row">
              {lessons.map((l) => (
                <div key={l.to} className="col col--3">
                  <Link to={l.to} className={styles.lessonCard}>
                    <Heading as="h3">{l.title}</Heading>
                    <p>{l.desc}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
