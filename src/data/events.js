export const serviceTypes = [
  {
    key: 'Baptism',
    description: 'Baptism applications, schedules, requirements, and records.',
    accent: 'blue'
  },
  {
    key: 'Wedding',
    description: 'Wedding applications, schedules, requirements, and records.',
    accent: 'gold'
  },
  {
    key: 'Funeral Service',
    description: 'Funeral service requests, schedules, documents, and records.',
    accent: 'purple'
  }
];

export const initialRequests = [
  {
    id: 1,
    service: 'Baptism',
    applicant: 'Maria Santos',
    childName: 'Lucas Santos',
    date: '2026-09-25',
    time: '10:00 AM',
    venue: 'Main Church',
    status: 'Approved',
    notes: 'Family baptism request.',
    attachments: []
  },
  {
    id: 2,
    service: 'Wedding',
    applicant: 'Juan & Maria',
    date: '2026-09-27',
    time: '02:00 PM',
    venue: 'Main Church',
    status: 'Pending',
    notes: 'Wedding ceremony request.',
    attachments: []
  },
  {
    id: 3,
    service: 'Funeral Service',
    applicant: 'Reyes Family',
    deceasedName: 'Ana Reyes',
    date: '2026-09-28',
    time: '02:00 PM',
    venue: 'Parish Chapel',
    status: 'Pending',
    notes: 'Funeral service request.',
    attachments: []
  }
];
