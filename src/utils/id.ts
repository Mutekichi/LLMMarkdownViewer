export const generateUniqueId = (prefix?: string) => {
  // current timestamp (ms)
  const timestamp = Date.now();
  // use random number to avoid collision
  const randomSuffix = Math.floor(Math.random() * 1000);
  const prefixStr = prefix ? `${prefix}-` : '';
  return `${prefixStr}${timestamp}=${randomSuffix}`;
};
