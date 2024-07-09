declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        DB_URL_TEST: string;
        DB_URL_DEV: string;
        DB_NAME: string;
        DB_USER: string;
        DB_PASSWORD: string;
        DB_HOST: string;
      }
    }
  }
  
  // This export is necessary to make this a module
  export {}