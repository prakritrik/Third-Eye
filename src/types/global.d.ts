interface Navigator {
  sms?: {
    send: (options: { number: string; body: string }) => Promise<void>;
  };
} 