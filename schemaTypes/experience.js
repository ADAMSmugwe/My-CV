export default {
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    {
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'string',
      description: 'e.g., "2022" or "Jan 2022"',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'endDate',
      title: 'End Date',
      type: 'string',
      description: 'e.g., "Present", "2024", or "Dec 2024"',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Technologies used (e.g., React, TypeScript)',
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          {title: 'Briefcase', value: 'briefcase'},
          {title: 'Code', value: 'code'},
          {title: 'Award', value: 'award'},
        ],
      },
    },
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
}
