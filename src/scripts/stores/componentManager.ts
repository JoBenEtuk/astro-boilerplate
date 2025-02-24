import { atom } from 'nanostores';

export class ComponentElement extends HTMLElement {
    prototypeType: string;

    constructor() {
        super();

        this.prototypeType = this.constructor.name;

        if (this.id === '') {
            const index = $componentsManagerIncrement.get() + 1;
            $componentsManagerIncrement.set(index);
            this.id = `${this.constructor.name.toLowerCase()}-${index}`;
        }
    }

    // =============================================================================
    // Lifecycle
    // =============================================================================
    connectedCallback() {
        this.register();
    }

    disconnectedCallback() {
        this.unregister();
    }

    // =============================================================================
    // Methods
    // =============================================================================
    register() {
        $componentsManager.set([...$componentsManager.get(), this]);
    }
    unregister() {
        $componentsManager.set(
            $componentsManager.get().filter(($component) => $component.id !== this.id)
        );
    }
}

export const $componentsManagerIncrement = atom<number>(0);
export const $componentsManager = atom<ComponentElement[]>([]);

export const getComponentById = (id: string) => {
    return $componentsManager.get().find(($component) => $component.id === id);
};

export const getComponentsByPrototype = (
    prototype: string,
    selectorsToExclude: string[] | string | HTMLElement | ComponentElement = []
) => {
    let excludedSelectors: string[] = [];

    if (typeof selectorsToExclude === 'string') {
        excludedSelectors = [selectorsToExclude];
    } else if (Array.isArray(selectorsToExclude)) {
        excludedSelectors = selectorsToExclude;
    } else if (selectorsToExclude instanceof HTMLElement && selectorsToExclude.id) {
        excludedSelectors = [`#${selectorsToExclude.id}`];
    }

    return ($componentsManager.get() as ComponentElement[]).filter(
        ($component: ComponentElement) => {
            return (
                prototype === $component.prototypeType &&
                !excludedSelectors.some((selector: string) => $component.matches(selector))
            );
        }
    );
};
