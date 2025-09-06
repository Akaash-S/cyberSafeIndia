import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Shield, 
  Search, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Globe,
  Zap,
  Users,
  Award
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const features = [
    {
      icon: Search,
      title: 'Real-time URL Scanning',
      description: 'Scan any URL instantly for malware, phishing, and security threats using advanced threat intelligence.',
      color: 'text-primary-600'
    },
    {
      icon: Shield,
      title: 'Multi-layered Protection',
      description: 'Leverage VirusTotal, AbuseIPDB, and other security databases for comprehensive threat detection.',
      color: 'text-success-600'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Get insights into threat patterns, scan history, and security trends with interactive dashboards.',
      color: 'text-warning-600'
    },
    {
      icon: Globe,
      title: 'Browser Extension',
      description: 'Protect yourself while browsing with our lightweight browser extension that scans URLs automatically.',
      color: 'text-danger-600'
    }
  ];

  const stats = [
    { label: 'URLs Scanned', value: '1M+', icon: Search },
    { label: 'Threats Blocked', value: '50K+', icon: Shield },
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Success Rate', value: '99.9%', icon: Award }
  ];

  const recentThreats = [
    { type: 'Phishing', count: 234, trend: '+12%' },
    { type: 'Malware', count: 89, trend: '-5%' },
    { type: 'Suspicious', count: 156, trend: '+8%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 dark:bg-primary-800 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-3/4 right-1/4 w-64 h-64 bg-primary-300 dark:bg-primary-700 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                cybersafe{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
                  INDIA
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                Protecting India's digital frontier with advanced threat detection, 
                real-time URL scanning, and comprehensive security analytics.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {user ? (
                // Show authenticated user actions
                <>
                  <Link to="/scan">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>Scan URL Now</span>
                    </motion.button>
                  </Link>
                  <Link to="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>View Dashboard</span>
                    </motion.button>
                  </Link>
                </>
              ) : (
                // Show unauthenticated user actions
                <>
                  <Link to="/auth">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Get Started</span>
                    </motion.button>
                  </Link>
                  <Link to="/auth">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>Learn More</span>
                    </motion.button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose cybersafe INDIA?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our comprehensive security platform provides multi-layered protection 
              against evolving cyber threats with cutting-edge technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="card text-center hover:shadow-xl transition-shadow duration-300"
                >
                  <div className={`w-16 h-16 ${feature.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Threat Intelligence Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Real-time Threat Intelligence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Stay ahead of emerging threats with our comprehensive threat intelligence 
              and real-time monitoring capabilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Advanced Threat Detection
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Multi-Engine Scanning</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Leverage 70+ antivirus engines and threat intelligence sources
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Real-time Analysis</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get instant results with sub-second response times
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Machine Learning</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      AI-powered threat detection for zero-day attacks
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Recent Threat Activity
              </h3>
              <div className="space-y-4">
                {recentThreats.map((threat, index) => (
                  <motion.div
                    key={threat.type}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-warning-600" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {threat.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {threat.count}
                      </div>
                      <div className={`text-sm ${threat.trend.startsWith('+') ? 'text-danger-600' : 'text-success-600'}`}>
                        {threat.trend}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Secure Your Digital Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join thousands of users who trust cybersafe INDIA for their cybersecurity needs. 
              Start scanning URLs and protecting yourself today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                // Show authenticated user actions
                <>
                  <Link to="/scan">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Zap className="w-5 h-5" />
                      <span>Start Scanning</span>
                    </motion.button>
                  </Link>
                  <Link to="/analytics">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <TrendingUp className="w-5 h-5" />
                      <span>View Analytics</span>
                    </motion.button>
                  </Link>
                </>
              ) : (
                // Show unauthenticated user actions
                <>
                  <Link to="/auth">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Sign In to Get Started</span>
                    </motion.button>
                  </Link>
                  <Link to="/auth">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <TrendingUp className="w-5 h-5" />
                      <span>Learn More</span>
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
