class DarkModeComponent extends HTMLElement {
	constructor() {
		super();
		this._onSelect = this._onSelect.bind(this);
		this._onSystemChange = this._onSystemChange.bind(this);
	}

	connectedCallback() {
		this.innerHTML = `
<wa-dropdown id="colorMode">
	<wa-button slot="trigger" appearance="filled" size="medium">
		<wa-icon id="cmIcon" name="circle-half-stroke" label="Theme: System"></wa-icon>
	</wa-button>

	<!-- Use checkable items to reflect selection -->
	<wa-dropdown-item type="checkbox" value="dark">Dark</wa-dropdown-item>
	<wa-dropdown-item type="checkbox" value="light">Light</wa-dropdown-item>
	<wa-dropdown-item type="checkbox" value="system">System</wa-dropdown-item>
</wa-dropdown>
`;

		this.dropdown = this.querySelector('#colorMode');
		this.icon = this.querySelector('#cmIcon');
		this.items = Array.from(this.querySelectorAll('wa-dropdown-item'));

		// selection handler from dropdown
		this.dropdown.addEventListener('wa-select', this._onSelect);

		// watch OS theme changes when in "system"
		this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		this.mediaQuery.addEventListener('change', this._onSystemChange);

		// initial apply
		const saved = localStorage.getItem('colorMode') || 'system';
		this._applyMode(saved);
	}

	disconnectedCallback() {
		this.dropdown.removeEventListener('wa-select', this._onSelect);
		this.mediaQuery.removeEventListener('change', this._onSystemChange);
	}

	_onSelect(e) {
		// Dropdown emits `wa-select` with detail.item
		const item = e.detail.item;
		const mode = item.value || item.textContent.trim();
		localStorage.setItem('colorMode', mode);
		this._applyMode(mode);
	}

	_onSystemChange() {
		if ((localStorage.getItem('colorMode') || 'system') === 'system') {
			this._applyMode('system');
		}
	}

	_applyMode(mode) {
		// determine actual theme
		const actual =
			mode === 'system' ? (this.mediaQuery.matches ? 'dark' : 'light') : mode;

		// update checked state (radio-like)
		this.items.forEach(it => {
			if (it.type === 'checkbox') it.checked = it.value === mode;
		});

		// update trigger icon + accessible label
		const iconName =
			mode === 'system' ? 'circle-half-stroke' : mode === 'dark' ? 'moon' : 'sun';
		this.icon.setAttribute('name', iconName);
		this.icon.setAttribute('label', `Theme: ${mode[0].toUpperCase()}${mode.slice(1)}`);

		// swap classes on <html>
		document.documentElement.classList.toggle('wa-dark', actual === 'dark');
		document.documentElement.classList.toggle('wa-light', actual === 'light');

		// notify listeners
		document.dispatchEvent(new CustomEvent('change-theme', { detail: actual }));
	}
}

customElements.define('c-darkmode', DarkModeComponent);
