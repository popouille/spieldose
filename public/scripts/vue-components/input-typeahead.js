let inputTypeahead = (function () {
    "use strict";

    const template = function () {
        return `
            <input class="input" type="text" v-bind:placeholder="placeholder" v-bind:disabled="loading" v-model.trim="text" v-on:keyup.esc="onClear" v-on:keyup="onChange">
        `;
    };

    /* input typeahead component */
    let module = Vue.component('spieldose-input-typeahead', {
        template: template(),
        data: function () {
            return ({
                text: null,
                timeout: null
            });
        },
        props: [
            'placeholder', 'loading'
        ],
        methods: {
            onClear: function () {
                this.text = null;
            },
            onChange: function (e) {
                if (e.key != "Alt" && e.key != "Tab" && e.key != "Control" && e.key != "Shift" && e.key != "CapsLock" && e.key != "AltGraph" && e.key != "Enter" && e.key != "ArrowLeft" && e.key != "ArrowRight" && e.key != "ArrowUp" && e.key != "ArrowDown") {
                    if (this.timeout) {
                        clearTimeout(this.timeout);
                    }
                    this.timeout = setTimeout(() => {
                        this.$emit("on-value-change", this.text);
                    }, 256);
                }
            }
        }
    });

    return (module);
})();