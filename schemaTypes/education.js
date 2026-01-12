export default {
  name: 'education',
  title: 'Education',
  type: 'document',
  fields: [
    {
      name: 'institution',
      title: 'Institution',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'degree',
      title: 'Degree',
      type: 'string',
      description: 'e.g., "Bachelor of Science in Computer Science"',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'field',
      title: 'Field of Study',
      type: 'string',
      description: 'e.g., "Computer Science", "Software Engineering"',
    },
    {
      name: 'startYear',
      title: 'Start Year',
      type: 'string',
      description: 'e.g., "2018"',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'endYear',
      title: 'End Year',
      type: 'string',
      description: 'e.g., "2022" or "Present"',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Achievements, GPA, honors, etc.',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g., "New York, USA"',
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'degree',
      subtitle: 'institution',
      year: 'endYear',
    },
    prepare(selection) {
      const {title, subtitle, year} = selection
      return {
        title: title,
        subtitle: `${subtitle} - ${year || 'Present'}`,
      }
    },
  },
}
