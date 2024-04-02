export const options = {
  definition:{
    openapi: '3.0.0',
    info:{
      title: 'Kryptomerch API',
      version: '1.0.0',
      description: 'Express library API',

    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components:{
      securitySchemes:{
        bearerAuth:{
          type:'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {   
        bearerAuth: [],
      },
    ],
  },
  apis:['./src/api/routes/*.ts'],
};