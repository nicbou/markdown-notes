// First, we define our own gfm spinoff
// Then, we multiplex it with LaTeX
CodeMirror.defineMode("gfm-custom", function(config) {
  var codeDepth = 0;
  function blankLine(state) {
    state.code = false;
    return null;
  }
  var gfmOverlay = {
    startState: function() {
      return {
        code: false,
        codeBlock: false,
        ateSpace: false
      };
    },
    copyState: function(s) {
      return {
        code: s.code,
        codeBlock: s.codeBlock,
        ateSpace: s.ateSpace
      };
    },
    token: function(stream, state) {
      // Hack to prevent formatting override inside code blocks (block and inline)
      if (state.codeBlock) {
        if (stream.match(/^```/)) {
          state.codeBlock = false;
          return "code-bracket-end";
        }
        stream.skipToEnd();
        return "code";
      }
      if (stream.sol()) {
        state.code = false;
      }
      if (stream.sol() && stream.match(/^```/)) {
        stream.skipToEnd();
        state.codeBlock = true;
        return "code-bracket-start";
      }

      // If this block is changed, it may need to be updated in Markdown mode
      if (stream.peek() === '`') {
        stream.next();
        var before = stream.pos;
        stream.eatWhile('`');
        var difference = 1 + stream.pos - before;
        if (!state.code) {
          codeDepth = difference;
          state.code = true;
        } else {
          if (difference === codeDepth) { // Must be exact
            state.code = false;
          }
        }
        return null;
      } else if (state.code) {
        stream.next();
        return null;
      }
      // Check if space. If so, links can be formatted later on
      if (stream.eatSpace()) {
        state.ateSpace = true;
        return null;
      }
      if (stream.match(/^((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\([^\s()<>]*\))+(?:\([^\s()<>]*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i) &&
         stream.string.slice(stream.start - 2, stream.start) != "](") {
        return "link";
      }
      stream.next();
      return null;
    },
    blankLine: blankLine
  };
  CodeMirror.defineMIME("gfm-custom", {
    name: "markdown",
    underscoresBreakWords: false,
    taskLists: true,
    fencedCodeBlocks: true
  });
  return CodeMirror.overlayMode(CodeMirror.getMode(config, "gfm-custom"), gfmOverlay);
}, "markdown");


CodeMirror.defineMode("gfm-latex", function(config, parserConfig) {
    return CodeMirror.multiplexingMode(
        CodeMirror.getMode(config, "gfm-custom"),
        {
            open: "$$$",
            close: "$$$",
            mode: CodeMirror.getMode(config, "text/x-latex"),
            delimStyle: "delimit-latex delimit-latex-block",
            innerStyle: "latex latex-block",
        },
        {
            open: "$$",
            close: "$$",
            mode: CodeMirror.getMode(config, "text/x-latex"),
            delimStyle: "delimit-latex",
            innerStyle: "latex",
        }
    );
}, 'gfm');