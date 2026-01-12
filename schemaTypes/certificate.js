export default {
  name: 'certificate',
  title: 'Certificates',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Certificate Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'issuer',
      title: 'Issuing Organization',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'issueDate',
      title: 'Issue Date',
      type: 'string',
      description: 'e.g., "January 2024" or "2024"',
    },
    {
      name: 'expiryDate',
      title: 'Expiry Date',
      type: 'string',
      description: 'Leave empty if it doesn\'t expire',
    },
    {
      name: 'credentialId',
      title: 'Credential ID',
      type: 'string',
      description: 'Certificate ID or credential number',
    },
    {
      name: 'credentialUrl',
      title: 'Credential URL',
      type: 'url',
      description: 'Link to verify the certificate',
    },
    {
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Skills covered in this certificate',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
    },
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
}
