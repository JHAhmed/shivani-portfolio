import { cursorState } from "./state.svelte";

export { default as Button } from "./shared/Button.svelte";

export function activeDiv(node, message = 'Hello there!') {

    node.addEventListener('mouseenter', () => {
        cursorState.message = message;
        cursorState.popupActive = true
    });
    node.addEventListener('mouseleave', () => {
        cursorState.popupActive = false
    });

    return {
        destroy() {
            node.removeEventListener('mouseenter', () => {
                cursorState.popupActive = true
            });
            node.removeEventListener('mouseleave', () => {
                cursorState.popupActive = false
            });
        }
    };
}