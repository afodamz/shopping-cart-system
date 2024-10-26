
export const corsOptions = {
    methods: ['GET','POST','DELETE','PUT'],
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    optionsSuccessStatus: 200,
    credentials: true,
};