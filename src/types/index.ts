export interface Service {
  id: string;
  title: string;
  duration: string;
  description: string;
  price?: string;
  features: string[];
  category: 'sortie' | 'hebergement' | 'formation';
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Season {
  name: string;
  months: string;
  modifier: number;
  description: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
}
