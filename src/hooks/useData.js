import { projects, services } from '../data';
import faq from '../data/faq.json';

// One boundary for local data today. Replace these values with Firestore reads later.
export function useData() {
  return { projects, services, faq };
}
