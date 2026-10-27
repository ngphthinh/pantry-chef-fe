import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IKeyValueStorage } from './types';

export class AsyncKeyValueStorage implements IKeyValueStorage {
  get = (key: string) => AsyncStorage.getItem(key);
  set = (key: string, value: string) => AsyncStorage.setItem(key, value);
  remove = (key: string) => AsyncStorage.removeItem(key);
}
