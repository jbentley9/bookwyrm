import { createCookieSessionStorage } from "react-router";

type SessionData = {
    user: {
        name: string;
        email: string;
    };
};

type SessionFlashData = {
    error: string | null;
};

const { getSession, commitSession, destroySession } = createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
        name: "__session",
        secrets: ["s3cr3t"],
        
    }
});

export { getSession, commitSession, destroySession };
