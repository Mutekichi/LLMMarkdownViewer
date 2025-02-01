interface EnvironmentConfig {
  apiUrl: string;
  websiteUrl: string;
  endpoints: {
    [key: string]: string;
  };
}

interface Config {
  development: EnvironmentConfig;
  // production: EnvironmentConfig;
}

const config: Config = {
  development: {
    apiUrl: 'http://localhost:8080/api',
    websiteUrl: 'http://localhost:8080',
    endpoints: {
      create3DModel: '/create3DModel',
      download3DModel: '/download3DModel',
    },
  },
  // development: {
  //   apiUrl: 'https://api.adxr.jp/api/v1',
  //   websiteUrl: 'https://api.adxr.jp',
  //   endpoints: {
  //     create3DModel: '/create3DModel',
  //     download3DModel: '/download3DModel',
  //   },
  // },
};

const environment = process.env.NODE_ENV || 'development';

const currentConfig: EnvironmentConfig = config[environment as keyof Config];

export default currentConfig;
