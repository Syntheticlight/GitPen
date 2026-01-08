<template>
  <pre ref="codeEditorRoot" class="code-editor textfield prism" :disabled="isDisabled"></pre>
</template>

<script>
import Prism from 'prismjs';
import cledit from '../services/editor/cledit';

export default {
  props: ['value', 'lang', 'disabled', 'scrollClass'],
  data() {
    return {
      clEditor: null,
    };
  },
  computed: {
    isDisabled() {
      // Handle both boolean and string "true"/"false"
      return this.disabled === true || this.disabled === 'true';
    },
  },
  watch: {
    value: {
      handler(newValue) {
        // Update content when value prop changes
        if (this.clEditor && newValue !== undefined && newValue !== null) {
          this.clEditor.setContent(newValue);
        }
      },
      immediate: false,
    },
  },
  mounted() {
    const preElt = this.$refs.codeEditorRoot;
    let scrollElt = preElt;
    const scrollCls = this.scrollClass || 'modal';
    while (scrollElt && !scrollElt.classList.contains(scrollCls)) {
      scrollElt = scrollElt.parentNode;
    }
    if (scrollElt) {
      this.clEditor = cledit(preElt, scrollElt);
      this.clEditor.on('contentChanged', value => this.$emit('changed', value));
      this.clEditor.init({
        content: this.value || '',
        sectionHighlighter: section => Prism.highlight(section.text, Prism.languages[this.lang], this.lang),
      });
      this.clEditor.toggleEditable(!this.isDisabled);
    }
  },
};
</script>

<style lang="scss">
@import '../styles/variables.scss';

.code-editor {
  margin: 0;
  font-family: $font-family-monospace;
  font-size: $font-size-monospace;
  font-variant-ligatures: no-common-ligatures;
  word-break: break-word;
  word-wrap: normal;
  height: auto;
  caret-color: #000;
  min-height: 160px;
  overflow: auto;
  padding: 0.2em 0.4em;

  .app--dark & {
    caret-color: $editor-color-dark-low;
  }

  * {
    line-height: $line-height-base;
    font-size: inherit !important;
  }
}
</style>
