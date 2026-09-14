import AsyncStorage from '@react-native-async-storage/async-storage';

let activeUserId = null;

export const setActiveUser = (userId) => {
  activeUserId = userId ? String(userId) : null;
};

const getScopedKey = (key) =>
  `${activeUserId ? `user:${activeUserId}` : 'guest'}:${key}`;

export const userStorage = {
  getItem: (key) => AsyncStorage.getItem(getScopedKey(key)),
  setItem: (key, value) => AsyncStorage.setItem(getScopedKey(key), value),
  removeItem: (key) => AsyncStorage.removeItem(getScopedKey(key)),
};
