/**
 * games/cosy_world/js/ui/modal.js
 * Modal dialog overlay open/close helper.
 */

export class ModalManager {
    static openModal() {
        const m = document.getElementById('cw-modal');
        if (m) m.classList.add('open');
    }

    static closeModal() {
        const m = document.getElementById('cw-modal');
        if (m) m.classList.remove('open');
    }
}
