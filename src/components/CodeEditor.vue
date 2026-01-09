<template>
  <pre ref="codeEditorRoot" class="code-editor textfield prism" :disabled="disabled"></pre>
</template>

<script>
import Prism from 'prismjs';
// Import language components for syntax highlighting
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating'; // Required by handlebars
import 'prismjs/components/prism-handlebars';
import cledit from '../services/editor/cledit';

export default {
  props: ['value', 'lang', 'disabled', 'scrollClass'],
  mounted() {
    const preElt = this.$refs.codeEditorRoot;
    let scrollElt = preElt;
    const scrollCls = this.scrollClass || 'modal';
    while (scrollElt && !scrollElt.classList.contains(scrollCls)) {
      scrollElt = scrollElt.parentNode;
    }
    if (scrollElt) {
      const clEditor = cledit(preElt, scrollElt);
      clEditor.on('contentChanged', value => this.$emit('changed', value));
      
      // Get the grammar, fallback to markup if language not found
      const grammar = Prism.languages[this.lang] || Prism.languages.markup;
      
      clEditor.init({
        content: this.value,
        sectionHighlighter: section => Prism.highlight(section.text, grammar, this.lang),
      });
      clEditor.toggleEditable(!this.disabled);
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
