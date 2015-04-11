//Custom renderer for marked.js. Adds support for task lists and other 
//app-specific elements

var customRenderer = new marked.Renderer();
customRenderer.listitem = function(text){
    var output = '<li>' + text + '</li>';
    if(text.indexOf('[ ]')===0){
        output = '<span class="checkbox">✗</span>' + text.substring(3);
        output = '<li class="task task-open">' + output + '</li>';
    }
    if(text.indexOf('[x]')===0){
        output = '<span class="checkbox">✓</span>' + text.substring(3);
        output = '<li class="task task-closed">' + output + '</li>';
    }
    return output;
};

customRenderer.latex = function(text){
    if(text.substring(0,3)==='$$$'){
        el = $("<div class='latex block'></div>");
    }
    else{
        el = $("<span class='latex inline'></span>");
    }
    
    el.text(text);
    el.attr('data-formula', text);
    return el.prop('outerHTML');
};