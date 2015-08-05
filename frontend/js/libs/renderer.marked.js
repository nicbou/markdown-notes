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

//Override the link renderer to have target="_blank"
customRenderer.link = function(href, title, text) {
    var out = '',
        isRelativeLink = +href !== NaN && +href % 1 === 0; //if href is a whole number
        target = 'target="_blank"';
    
    if (this.options.sanitize) {
        try {
            var prot = decodeURIComponent(unescape(href))
                .replace(/[^\w:]/g, '')
                .toLowerCase();
        } catch (e) {
            return '';
        }
        if (prot.indexOf('javascript:') === 0) {
            return '';
        }
    }

    if(isRelativeLink){ 
        href = '#?note=' + href;
        target = '';
    }

    var out = '<a ' + target + ' href="' + href + '"';
    if (title) {
        out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
};