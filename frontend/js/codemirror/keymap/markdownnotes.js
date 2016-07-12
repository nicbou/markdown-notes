// A number of additional default bindings that are too obscure to
// include in the core codemirror.js file.

(function() {
    //Modifier key to use: Ctrl on windows, Cmd on OS X
    var ctrl = CodeMirror.keyMap["default"] === CodeMirror.keyMap.pcDefault ? "Ctrl-" : "Cmd-";

    function toggleWrap(cm, before, after) {
        var selectedStrings = cm.getSelections(),
            selections,
            wrap;

        //"bob" will be wrapped, "**bob**" will be unwrapped
        wrap = !(
            selectedStrings[0].indexOf(before)===0 &&
            selectedStrings[0].substring(selectedStrings[0].length-after.length)===after
        );

        //First wrap the text
        for(var i in selectedStrings){
            if(wrap){
                selectedStrings[i] = before + selectedStrings[i] + after;
            }
            else{
                selectedStrings[i] = selectedStrings[i].substring(before.length);
                selectedStrings[i] = selectedStrings[i].substring(0, selectedStrings[i].length-after.length);
            }
        }
        cm.replaceSelections(selectedStrings, "around");

        if(wrap){
            //Then move the cursor inside the parentheses
            selections = cm.listSelections();
            selections.forEach(function(selection){
                //Anchor before head
                if(
                    selection.head.line > selection.anchor.line ||
                    (selection.head.line == selection.anchor.line && selection.head.ch > selection.anchor.ch)
                ){
                    selection.anchor.ch += before.length;
                    selection.head.ch -= after.length;
                }
                //Anchor after head
                else if(
                    selection.anchor.line > selection.head.line ||
                    (selection.head.line == selection.anchor.line && selection.head.ch <= selection.anchor.ch)
                ){
                    selection.head.ch += before.length;
                    selection.anchor.ch -= after.length;
                }
                return selection;
            });
            cm.setSelections(selections);
        }
    }

    CodeMirror.commands.toggleBold = function(cm){toggleWrap(cm, '**', '**');};
    CodeMirror.commands.toggleItalics = function(cm){toggleWrap(cm, '*', '*');};

    CodeMirror.commands.toggleLink = function(cm, type){
        var prefix = (type==="image") ? '![' : '[',
            cursor = {},
            selectedStrings = cm.getSelections(),
            selections;

        //First replace text with [text]()
        for(var i in selectedStrings){
            selectedStrings[i] = prefix + selectedStrings[i] + ']()';
        }
        cm.replaceSelections(selectedStrings, "around");

        //Then move the cursor inside the parentheses
        selections = cm.listSelections();
        selections.forEach(function(selection){
            //Anchor after tail
            if(selection.head.line > selection.anchor.line){
                cursor = {
                    line: selection.head.line,
                    ch: selection.head.ch-1,
                };
            }
            //Anchor after head
            else if(selection.anchor.line > selection.head.line){
                cursor = {
                    line: selection.anchor.line,
                    ch: selection.anchor.ch-1,
                };
            }
            //Anchor and head on same line
            else{
                cursor = {
                    line: selection.head.line,
                    ch: Math.max(selection.head.ch, selection.anchor.ch)-1,
                };
            }
            selection.head = selection.anchor = cursor;
            return selection;
        });
        cm.setSelections(selections);
    };

    CodeMirror.commands.toggleImageLink = function(cm){
        CodeMirror.commands.toggleLink(cm, "image");
    };

    CodeMirror.commands.toggleFold = function(cm){
        cm.foldCode(cm.getCursor(), {scanUp: true});
    };

    CodeMirror.keyMap["default"][ctrl+"B"] = "toggleBold";
    CodeMirror.keyMap["default"][ctrl+"I"] = "toggleItalics";
    CodeMirror.keyMap["default"][ctrl+"K"] = "toggleLink";
    CodeMirror.keyMap["default"][ctrl+"Q"] = "toggleFold";
    CodeMirror.keyMap["default"]["Shift-"+ctrl+"K"] = "toggleImageLink";
    CodeMirror.keyMap["default"]["Enter"] = "newlineAndIndentContinueMarkdownList";
})();
