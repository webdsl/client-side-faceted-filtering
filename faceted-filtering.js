var hidableElems, facetPlaceholderElems;
var facetButtonClass = "btn-xs btn btn-default";
function updateFacets(){
    if(!hidableElems){
      hidableElems = $('.hidable');
      facetPlaceholderElems = $('.facet-placeholder');
      initSelectionFromUrl()
    }
    facetPlaceholderElems.each( function(){
        var current = $(this);
        var facetType = current.data('facet-type');
        var dataAttr = 'data-facet-' + facetType;
        var s = facetRetrievalClasses(facetType);
        var valArray = $(s+ ' ['+ dataAttr + ']')
            .map( function(){ return $(this).attr(dataAttr+'-order') + '%%' +$(this).attr(dataAttr) } );
        var htmlArr = $( unique(valArray).sort() )
            .map( function(){
                var txt = this.replace(/([^%]*%%)?(.*)/,'$2');
                if(txt.length < 1){
                    return "";
                }
                var ident = '%%'+ txt +'%%';
                var sel = current.attr('data-selected-facets');
                var btnClass = facetButtonClass + ' facet-' + ( typeof(sel) !== 'undefined' && sel.indexOf(ident) > -1);
                return '<div class="' + btnClass + '">' + txt + '</div>' }
            );
        $(this).html( htmlArr.get().join('') );
        $(this).children().click(toggleFacet);
    });
}
function facetRetrievalClasses(facettype){
    var filtered = facetPlaceholderElems.filter('[data-selected-facets*="%%"][data-facet-type!="' + facettype + '"]');
    var mapped = filtered.map( function(){ return '.facet-selected-' + $(this).data('facet-type') });
    return '*' + mapped.get().join('');
}

function unique(array) {
    return $.grep(array, function(el, index) {
        return index === $.inArray(el, array);
    });
}

function initSelectionFromUrl(){
    var queryString = window.location.search;
    if(queryString.length){
        facetPlaceholderElems.each( function(){
            var facetType = $(this).data('facet-type');
            var key = encodeURIComponent(facetType);
            var r = new RegExp("(&|\\?)"+key+"=([^\&]*)");
            match = r.exec(queryString);
            if(match != null){
                var val = decodeURIComponent(match[2]);
                var selections = '%%' + val.split(',').join('%%%%') + '%%';
                $(this).attr('data-selected-facets', selections );
            }
        } );
        filterFacets();
    }
}

function toggleFacet(event){
    var elemText = event.currentTarget.innerHTML;
    var facetPlaceholder = $(event.currentTarget).parent('.facet-placeholder');
    var facetType = facetPlaceholder.data('facet-type');
    var currentSel = facetPlaceholder.attr('data-selected-facets');
    var ident = '%%'+elemText+'%%';
    if(!currentSel){
      currentSel = ""
    }
    if( currentSel.indexOf(ident) > -1 ){
        facetPlaceholder.attr('data-selected-facets', currentSel.replace(ident, '') );
    } else {
        var newVal = currentSel + ident;
        facetPlaceholder.attr('data-selected-facets', newVal );
    }
    filterFacets();
    updateFacets();    
}
function filterFacets(){
    var newSearchString = document.location.search;
    var classSelector = '*';
    facetPlaceholderElems.filter('[data-selected-facets]').each( function(){
        var type = $(this).data('facet-type');
        var dataSelector = 'data-facet-' + type;
        var myRegexp = /%%([^%]+)%%/g;
        var selectedStr = $(this).attr('data-selected-facets');
        match = myRegexp.exec(selectedStr);
        var selectors = [];
        var matches = []
        if(selectedStr.length > 0){
            while (match != null) {
              matches.push(match[1]);
              selectors.push('[' + dataSelector + '="' + match[1] +'"]');
              match = myRegexp.exec(selectedStr);              
            }
        }
        newSearchString = insertParam2(newSearchString, type, matches.join(','));
        
        var cl = 'facet-selected-' + type
        hidableElems.removeClass(cl);    
        if(selectors.length){
            var selectorsStr = selectors.join(',');
            var valueHolders = $(selectorsStr);
            valueHolders.closest('.hidable').addClass(cl);
            valueHolders.find('.hidable:not(:has(.hidable))').addClass(cl);
            classSelector += '.'+cl;
        }
    });
    if(newSearchString != document.location.search){
        var newUrl = window.location.protocol
        + "//"
        + window.location.host
        + window.location.pathname
        + newSearchString
        + window.location.hash;
        history.replaceState(null, document.title + " - filtered", newUrl);
    }
    hidableElems.attr('data-is-visible', false);
    hidableElems.filter(classSelector +', :has(' + classSelector + ')').attr('data-is-visible', true);
    hidableElems.filter('[data-is-visible!=true]').hide();
    hidableElems.filter('[data-is-visible=true]').show();
}

function insertParam2(searchString, key,value)
{
    key = encodeURIComponent(key); value = encodeURIComponent(value);
    var s = searchString.length ? searchString.substring(1, searchString.length) : "";
    var kvp = value.length ? key+"="+value : "";
    var r = new RegExp("(^|&)"+key+"=[^\&]*");
    s = kvp.length ? s.replace(r,"$1"+kvp) : s.replace(r,"");
    if(kvp.length && s.indexOf(kvp) < 0) {s += (s.length>0 ? '&' : '') + kvp;};

    return "?" + s;
}

$('document').ready( updateFacets );
