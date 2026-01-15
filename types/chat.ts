export type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string | React.ReactNode;
  type?: 'text' | 'options' | 'input' | 'result';
  options?: string[] | { key: string; label: string }[];
};