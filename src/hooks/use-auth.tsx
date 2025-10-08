import { useAuthState } from "react-firebase-hooks/auth";
import { clientAuth } from "@/config/firebaseClient";

export function UseUser() {
    const [user, loading] = useAuthState(clientAuth);
    // ...
}
