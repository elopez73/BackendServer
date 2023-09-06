import express from 'express';
import apiRoutes from './routes/api.js';
import listRoutes from './routes/lists.js'
import authRoutes from './routes/auth.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import StorageAPI from './routes/StorageAPI.js';

const app = express();
const corsOptions = {
    origin: 'https://main--golden-panda-a78175.netlify.app',
    credentials: true,
    optionSuccessStatus: 200
}
app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    key: "user",
    secret: process.env.SESSION_SECRET || 'QwYWJugPaE6GmmZAG3UZ',
    resave: true,
    saveUninitialized: false,
    cookie: {
        expires: 600000,
        sameSite: 'none', // Add this
        secure: true
    },
}));
app.use('/api', apiRoutes);
const PORT = process.env.PORT || 3001;
app.use("/api/lists", listRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/StorageAPI", StorageAPI);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
