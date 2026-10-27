export const env = {
  useMock: (process.env.EXPO_PUBLIC_USE_MOCK ?? 'true') === 'true',
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api',
};
