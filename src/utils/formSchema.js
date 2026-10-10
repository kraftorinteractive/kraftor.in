import { z } from 'zod';

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  company: z.string().trim().max(120).optional(),
  phone: z.string().trim().min(6, 'Please enter a valid phone number.').max(24),
  email: z.string().trim().email('Please enter a valid email address.').max(150),
  whatsapp: z.string().trim().min(6, 'Please enter a valid WhatsApp number.').max(24),
  country: z.string().min(1, 'Please select your country.'),
  service: z.string().min(1, 'Please select a project type.'),
  projectName: z.string().trim().min(2, 'Please enter a project name.').max(140),
  projectInfo: z.string().trim().max(1800).optional(),
  budget: z.string().min(1, 'Please select a budget range.'),
});
