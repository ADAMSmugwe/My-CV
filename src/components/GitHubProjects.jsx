import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, ExternalLink } from 'lucide-react';

const GitHubProjects = ({ username = 'ADAMSmugwe' }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        // Fetch repos sorted by stars (best proxy for pinned/important repos)
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?sort=stars&per_page=6&direction=desc`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        
        const data = await response.json();
        setRepos(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (username !== 'YOUR_GITHUB_USERNAME') {
      fetchRepos();
    } else {
      setLoading(false);
    }
  }, [username]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    viewport: { once: true, margin: "-100px" }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-apple-grey rounded-apple p-8 h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Unable to load GitHub projects. Please check the username.</p>
      </div>
    );
  }

  if (username === 'YOUR_GITHUB_USERNAME') {
    return (
      <div className="text-center py-12 bg-apple-grey rounded-apple">
        <p className="text-zinc-600 text-lg">
          Replace <code className="px-2 py-1 bg-white rounded font-mono text-sm">YOUR_GITHUB_USERNAME</code> with your GitHub username to display live projects.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo, index) => (
        <motion.a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          {...fadeInUp}
          transition={{ 
            duration: 0.8, 
            ease: [0.22, 1, 0.36, 1],
            delay: index * 0.1 
          }}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-apple p-8 hover:shadow-xl transition-shadow duration-300 border border-zinc-100 group"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold tracking-tight group-hover:text-apple-blue transition-colors">
              {repo.name}
            </h3>
            <ExternalLink className="w-5 h-5 text-zinc-400 group-hover:text-apple-blue transition-colors" />
          </div>
          
          <p className="text-zinc-600 text-sm mb-6 line-clamp-2 leading-relaxed">
            {repo.description || 'No description available'}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            {repo.language && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-apple-blue"></span>
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              {repo.forks_count}
            </span>
          </div>
        </motion.a>
      ))}
    </div>
  );
};

export default GitHubProjects;
