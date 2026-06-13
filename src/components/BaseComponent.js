export class BaseComponent extends HTMLElement {
    constructor() {
        super();
        this.state = {};
    }

    connectedCallback() {
        this.render();
        this.afterRender();
    }

    /**
     * Updates the component state and triggers a re-render
     * @param {Object} newState 
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
        this.afterRender();
    }

    /**
     * Render the component's HTML template inside the element's innerHTML
     */
    render() {
        this.innerHTML = this.template();
    }

    /**
     * Component HTML Template (must be overridden by subclasses)
     * @returns {string} HTML string
     */
    template() {
        return '';
    }

    /**
     * Lifecycle hook executed after render. Useful for binding events.
     * Override in subclasses.
     */
    afterRender() {}

    /**
     * Emits custom DOM events to propagate state upwards
     * @param {string} eventName 
     * @param {Object} detail 
     */
    emit(eventName, detail = {}) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true
        }));
    }
}
