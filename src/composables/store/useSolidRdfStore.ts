import { reactive } from "vue";
import { WebReactiveQuintStore } from "@uvdsl/solid-rdf-store";
import { useSolidSession } from "../useSolidSession";
import { SessionEvents, SessionStateChangeDetail } from "@uvdsl/solid-oidc-client-browser";


const store = reactive(new WebReactiveQuintStore());

const { session } = useSolidSession();
session.addEventListener(SessionEvents.STATE_CHANGE, (event: Event) => {
    if (event instanceof CustomEvent) {
        const { isActive } = event.detail as SessionStateChangeDetail;
        if (!isActive) { // If the session becomes inactive (logout/expiration), wipe the cache.
            store.clear()
        }
    }
});

export const useSolidRdfStore = () => {
  return { store };
};

