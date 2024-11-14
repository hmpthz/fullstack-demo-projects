const envSchema = {
    VERCEL_ENV: false,
    DB_URL: true,
    LOCAL_DB: false,
    JWT_SECRET: true,
    GOOGLE_CLIENT_ID: true,
    GOOGLE_CLIENT_SECRET: true
} as const;

type BooleanToStringType<T> = {
    [K in keyof T]: T[K] extends true ? string : string | undefined;
};

type Env = BooleanToStringType<typeof envSchema> & {
    readonly APP_URL: string;
    validate: () => void;
};
export const env = {
    validate() {
        const thisAny = this as unknown as Record<string, string | undefined>;
        for (const [key, required] of Object.entries(envSchema)) {
            const value = process.env[key];
            if (!value && required) {
                throw new Error(`Env ${key} is required!`);
            }
            thisAny[key] = value;
        }
        // process special variables
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            // on Vercel deployment
            thisAny.APP_URL = 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL;
        }
        else {
            // on local development;
            thisAny.APP_URL = process.env.APP_URL;
            if (!thisAny.APP_URL) {
                throw new Error(`Env APP_URL is required!`);
            }
        }
        console.log('Environment variables validated.');
    }
} as Env;
