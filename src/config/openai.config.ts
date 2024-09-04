import OpenAI from 'openai';

export const openai = new OpenAI({
    // organization: "org-CDJhVDmDOeFPsCGTT1L3JEad",
    // project: "proj_Y6O0dszU9HmjOESHmXqyqhr9",
    apiKey: process.env['OPENAI_API_KEY'],
  });