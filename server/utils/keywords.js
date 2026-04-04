/**
 * Domain-specific keyword lists used to detect resume sections and calculate
 * section-wise ATS scores. These lists cover common tech, business, and
 * professional terminology.
 */

// Software / Programming languages
const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'scala', 'kotlin', 'swift',
  'objective-c', 'c', 'c++', 'c#', 'go', 'golang', 'rust', 'ruby', 'php',
  'perl', 'shell', 'bash', 'powershell', 'r', 'matlab', 'dart', 'groovy',
  'lua', 'elixir', 'erlang', 'haskell', 'clojure', 'fortran', 'cobol',
  'assembly', 'verilog', 'vhdl', 'solidity'
];

// Frontend technologies
const FRONTEND_TECH = [
  'react', 'vue', 'angular', 'svelte', 'nextjs', 'next.js', 'nuxt',
  'gatsby', 'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less',
  'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui',
  'antd', 'ant design', 'chakra', 'redux', 'zustand', 'mobx', 'recoil',
  'jquery', 'webpack', 'vite', 'parcel', 'rollup', 'babel', 'eslint',
  'storybook', 'graphql', 'apollo', 'relay', 'axios', 'fetch',
  'websocket', 'web3', 'threejs', 'd3', 'chart.js', 'recharts',
  'swr', 'react query', 'tanstack'
];

// Backend technologies
const BACKEND_TECH = [
  'node', 'nodejs', 'node.js', 'express', 'fastify', 'koa', 'nestjs',
  'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails',
  'laravel', 'symfony', 'asp.net', '.net', 'graphql', 'rest', 'restful',
  'grpc', 'microservices', 'serverless', 'lambda', 'api gateway',
  'kafka', 'rabbitmq', 'celery', 'redis', 'memcached', 'nginx',
  'apache', 'gunicorn', 'uwsgi', 'websockets', 'oauth', 'jwt',
  'passport', 'auth0', 'firebase'
];

// Databases
const DATABASES = [
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle',
  'mssql', 'sql server', 'nosql', 'mongodb', 'mongoose', 'cassandra',
  'dynamodb', 'couchdb', 'couchbase', 'elastic', 'elasticsearch',
  'redis', 'neo4j', 'influxdb', 'snowflake', 'bigquery', 'redshift',
  'hive', 'spark', 'hadoop', 'hbase', 'mariadb', 'cockroachdb',
  'firebase', 'supabase', 'planetscale', 'prisma', 'sequelize',
  'typeorm', 'hibernate', 'sqlalchemy'
];

// Cloud and DevOps
const CLOUD_DEVOPS = [
  'aws', 'azure', 'gcp', 'google cloud', 'cloud', 'ec2', 's3', 'lambda',
  'cloudfront', 'route53', 'rds', 'eks', 'ecs', 'fargate', 'sqs', 'sns',
  'iam', 'terraform', 'ansible', 'puppet', 'chef', 'docker', 'kubernetes',
  'k8s', 'helm', 'istio', 'ci/cd', 'jenkins', 'github actions', 'gitlab ci',
  'circleci', 'travis', 'argocd', 'prometheus', 'grafana', 'datadog',
  'splunk', 'elk', 'logstash', 'kibana', 'heroku', 'vercel', 'netlify',
  'digitalocean', 'linode', 'devops', 'devsecops', 'sre', 'linux', 'unix',
  'bash', 'shell', 'git', 'github', 'gitlab', 'bitbucket', 'jira',
  'confluence', 'agile', 'scrum', 'kanban', 'sprint'
];

// Data Science & ML
const DATA_ML = [
  'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml',
  'nlp', 'natural language processing', 'computer vision', 'neural network',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'xgboost',
  'lightgbm', 'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn',
  'plotly', 'jupyter', 'anaconda', 'data science', 'data analysis',
  'data engineering', 'etl', 'feature engineering', 'model deployment',
  'mlops', 'llm', 'transformers', 'bert', 'gpt', 'embedding', 'rag',
  'langchain', 'hugging face', 'statistics', 'regression', 'classification',
  'clustering', 'recommendation', 'time series', 'a/b testing'
];

// Soft skills (used in experience/summary scoring)
const SOFT_SKILLS = [
  'leadership', 'communication', 'collaboration', 'teamwork', 'problem-solving',
  'problem solving', 'analytical', 'critical thinking', 'creativity', 'initiative',
  'adaptability', 'flexibility', 'time management', 'attention to detail',
  'self-motivated', 'organized', 'presentation', 'negotiation', 'mentoring',
  'coaching', 'strategic', 'decision-making', 'customer-focused', 'stakeholder',
  'cross-functional', 'project management', 'product management'
];

// Professional experience indicators
const EXPERIENCE_INDICATORS = [
  'managed', 'led', 'developed', 'designed', 'implemented', 'built', 'created',
  'architected', 'optimized', 'improved', 'reduced', 'increased', 'delivered',
  'launched', 'deployed', 'maintained', 'migrated', 'refactored', 'collaborated',
  'coordinated', 'mentored', 'trained', 'researched', 'analyzed', 'automated',
  'integrated', 'scaled', 'supervised', 'directed', 'established', 'spearheaded',
  'overseen', 'oversaw', 'facilitated', 'streamlined', 'enhanced', 'accelerated',
  'achieved', 'exceeded', 'drove', 'transformed', 'championed', 'pioneered'
];

// Education-related keywords
const EDUCATION_KEYWORDS = [
  'bachelor', 'master', 'phd', 'doctorate', 'degree', 'diploma', 'certificate',
  'engineering', 'science', 'technology', 'computer', 'information', 'mathematics',
  'statistics', 'gpa', 'honors', 'summa cum laude', 'magna cum laude', 'cum laude',
  'university', 'college', 'institute', 'school', 'major', 'minor', 'coursework',
  'thesis', 'dissertation', 'graduate', 'undergraduate', 'postgraduate'
];

// Certification keywords
const CERTIFICATION_KEYWORDS = [
  'certified', 'certification', 'aws certified', 'google certified', 'microsoft certified',
  'azure', 'pmp', 'scrum master', 'pmi', 'cissp', 'ceh', 'ccna', 'ccnp',
  'cpa', 'cfa', 'comptia', 'itil', 'safe', 'six sigma', 'lean', 'prince2'
];

// All technical skills combined
const ALL_TECH_SKILLS = [
  ...PROGRAMMING_LANGUAGES,
  ...FRONTEND_TECH,
  ...BACKEND_TECH,
  ...DATABASES,
  ...CLOUD_DEVOPS,
  ...DATA_ML,
];

const ALL_KEYWORDS = {
  programmingLanguages: PROGRAMMING_LANGUAGES,
  frontend: FRONTEND_TECH,
  backend: BACKEND_TECH,
  databases: DATABASES,
  cloudDevops: CLOUD_DEVOPS,
  dataML: DATA_ML,
  softSkills: SOFT_SKILLS,
  experienceIndicators: EXPERIENCE_INDICATORS,
  education: EDUCATION_KEYWORDS,
  certifications: CERTIFICATION_KEYWORDS,
  allTechSkills: ALL_TECH_SKILLS,
};

module.exports = ALL_KEYWORDS;
