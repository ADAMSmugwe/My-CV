import { motion } from 'framer-motion';

const ProjectCard = ({ title, description, tech, gradient, span }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`project-card bg-gradient-to-br ${gradient} rounded-apple p-8 ${span} hover:shadow-2xl transition-shadow duration-300`}
    >
      <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-white/90 mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tech.map((item, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default ProjectCard;
