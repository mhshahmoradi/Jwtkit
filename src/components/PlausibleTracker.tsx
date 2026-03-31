import Plausible from "plausible-tracker";
import { type Component, onMount } from "solid-js";

export const plausible = Plausible({
    domain: "jwtkit.ir",
    apiHost: "http://plausible.jwtkit.ir"
});

const PlausibleTracker: Component = () => {
    onMount(() => {
        plausible.trackPageview();
        plausible.enableAutoPageviews();
    });

    return null;
};

export default PlausibleTracker;
