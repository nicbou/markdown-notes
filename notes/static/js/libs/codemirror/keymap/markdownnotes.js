// A number of additional default bindings that are too obscure to
// include in the core codemirror.js file.

(function() {
    //Modifier key to use: Ctrl on windows, Cmd on OS X
    var ctrl = CodeMirror.keyMap["default"] === CodeMirror.keyMap.pcDefault ? "Ctrl-" : "Cmd-";

    function toggleWrap(cm, before, after) {
        var selectedStrings = cm.getSelections();

        //"bob" will be wrapped, "**bob**" will be unwrapped
        var wrap = !(
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

        //Then remove the wrapping characters from the selection
        if(wrap){
            var selections = cm.listSelections();
            for(var i in selections){
                selections[i].head.ch -= before.length;
                selections[i].anchor.ch += after.length;
            }
            cm.setSelections(selections);
        }
    }

    CodeMirror.commands.toggleBold = function(cm){toggleWrap(cm, '**', '**');};
    CodeMirror.commands.toggleItalics = function(cm){toggleWrap(cm, '*', '*');};

    CodeMirror.commands.toggleLink = function(cm, type){
        var prefix = (type==="image") ? '![' : '[';

        //First replace text with [text]()
        var selectedStrings = cm.getSelections();
        for(var i in selectedStrings){
            selectedStrings[i] = prefix + selectedStrings[i] + ']()';
        }
        cm.replaceSelections(selectedStrings, "around");

        //Then move the cursor inside the parentheses
        var selections = cm.listSelections();
        for(var i in selections){
            selections[i].head.ch -= 1;
            selections[i].anchor = selections[i].head;
        }
        cm.setSelections(selections);
    };

    CodeMirror.commands.toggleImageLink = function(cm){
        CodeMirror.commands.toggleLink(cm, "image");
    };

    CodeMirror.keyMap["default"][ctrl+"B"] = "toggleBold";
    CodeMirror.keyMap["default"][ctrl+"I"] = "toggleItalics";
    CodeMirror.keyMap["default"][ctrl+"K"] = "toggleLink";
    CodeMirror.keyMap["default"]["Shift-"+ctrl+"K"] = "toggleImageLink";
    CodeMirror.keyMap["default"]["Enter"] = "newlineAndIndentContinueMarkdownList";
})();
