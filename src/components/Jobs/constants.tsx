export interface JobListing {
  id: string;
  title: string;
  salonName: string;
  salonId?: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  postedAt: string;
  description: string;
  tags: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
}
