var hidableElems, facetPlaceholderElems;
var facetButtonClass = "btn-xs btn btn-default";
var hasFiltersInURL = false;
function initFacets(){
  if(!hidableElems){
    hidableElems = $('.hidable');
    facetPlaceholderElems = $('.facet-placeholder');
    initSelectionFromUrl()
    updateFacets();
  }
}
function reloadFacets(){
  hidableElems = $('.hidable');
  facetPlaceholderElems = $('.facet-placeholder');
  updateFacets();
}
function updateFacets(){
    facetPlaceholderElems.each( function(){
        var current = $(this);
        var sel = current.attr('data-selected-facets');
        var hasSel = typeof(sel) !== 'undefined' && sel.length > 0;
        var facetType = current.data('facet-type');
        var dataAttr = 'data-facet-' + facetType;
        var s = facetRetrievalClasses(facetType);

        //scrape all values, prefixed with optional order (contain duplicates)
        var x = $(s + ' ['+ dataAttr + ']');
        if(s != '*'){
          var parents = $(s).parents('[' + dataAttr +']').addBack('[' + dataAttr +']');
          x = $.merge(parents,x);
        }
        var valArray = x
                      .map( function(){ return this.getAttribute(dataAttr+'-order') + '%%' +this.getAttribute(dataAttr) } );
        //sort values and remove order info
        valArraySorted = $( valArray.sort() )
                         .map( function(){ return this.replace(/([^%]*%%)?(.*)/,'$2'); } );
        
        //For already selected facets, assure they get displayed even when they do not exist in the scraped values
        if( hasSel ){
            var x = $(sel.split('%%%%'))
                    .map( function(){ return this.replace(/%%/g,'') });            
            $.merge(valArraySorted,x);
        } 
        var htmlArr = $(unique(valArraySorted)).map( function(){
                if(this.length < 1){
                    return "";
                }
                var ident = '%%'+ this +'%%';
                var btnClass = facetButtonClass + ' facet-' + ( hasSel && sel.indexOf(ident) > -1);
                return '<div class="' + btnClass + '">' + this + '</div>' }
            );
        var html = htmlArr.get().join('');
        if(html.length < 1){
            html = '<span class="no-facets">Nothing to filter</span>';
        }
        $(this).html( html );
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
            	hasFiltersInURL = true;
                var val = decodeURIComponent(match[2]);
                var selections = '%%' + val.split('+').join('%%%%') + '%%';
                $(this).attr('data-selected-facets', searchStringUnEscape(selections) );
            }
        } );
        filterFacets();
    }
}

function toggleFacet(event){
    var facetValue = event.currentTarget.textContent;
    var facetPlaceholder = $(event.currentTarget).parent('.facet-placeholder');
    doToggleFacet(facetPlaceholder, facetValue);
}
function doToggleFacet( facetPlaceholder , facetValue ){
    var facetType = facetPlaceholder.data('facet-type');
    var currentSel = facetPlaceholder.attr('data-selected-facets');
    var ident = '%%'+facetValue+'%%';
    var isInitToggle = isInitialFilter( facetType, facetValue );
    if(!currentSel){
      currentSel = ""
    }
    if( currentSel.indexOf(ident) > -1 ){
        if(!isInitToggle){ //don't remove filter if this is an initial filter value
          facetPlaceholder.attr('data-selected-facets', currentSel.replace(ident, '') );
        }
    } else {
        var newVal = currentSel + ident;
        facetPlaceholder.attr('data-selected-facets', newVal );
    }
    filterFacets();
    updateFacets();
    if( isInitToggle ){
      removeInitialFilter( facetType, facetValue )
    } 
}
function searchStringEscape(str) {
  return str.replace("+", "\\plus");
}
function searchStringUnEscape(str) {
  return str.replace("\\plus,", "+");
}
var initialFilters = {};
function filterKey( facetType, facetValue ){ return "filtered-"+facetType+"-" + facetValue; }
function addInitialFilter( facetType, facetValue ){
  if(!hasFiltersInURL){
    initialFilters[ filterKey(facetType, facetValue) ] = true;
    doToggleFacet( facetPlaceholderElems.filter('[data-facet-type=' + facetType + ']').first(), facetValue );
  }
}
function removeInitialFilter( facetType, facetValue ){
  initialFilters[ filterKey(facetType, facetValue) ] = false;
}
function isInitialFilter( facetType, facetValue ){
  return initialFilters[ filterKey(facetType, facetValue) ] === true;//.some(fil => fil.facetType === facetType && fil.facetValue === facetValue));
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
              if( !isInitialFilter( type, match[1] ) ){
                matches.push( searchStringEscape(match[1]) );
              }
              selectors.push('[' + dataSelector + '="' + match[1].replace('"','\\"') +'"]');
              match = myRegexp.exec(selectedStr);              
            }
        }
        newSearchString = insertParam2(newSearchString, type, matches.join('+'));
        
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
    if(classSelector != "*"){
        hidableElems.filter(classSelector).attr('data-is-visible', true)
                      .parents('.hidable').attr('data-is-visible', true);
    } else {
        hidableElems.filter(classSelector).attr('data-is-visible', true);
    }
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

$('document').ready( initFacets );