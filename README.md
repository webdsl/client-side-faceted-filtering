# client-side-faceted-filtering
Simple javascript library enabling easy implementation of client-side faceted search, or actually faceted filtering of DOM content.

## Demo
This library is used to provide filtering on program pages of conferences hosted on https://conf.researchr.org, such as:
- https://2018.programming-conference.org/program/program-programming-2018
- https://2018.splashcon.org/program/program-splash-2018

## Features
- Automatic generation of filterable values (the facets)
- Supports multiple facet categories
- Supports multiple facet selections from a single or multiple facet categories.
- Encodes filters into the URL using query-parameters, which are interpreted and applied when the library is loaded

## Dependencies
jQuery - this library is implemented heavily relying on jQuery selectors

## How to use

1. Include the js
`<script type="text/javascript" src="faceted-filtering.js"></script>`
The script will initialize faceted filtering on document ready
1. The lib will search for the following DOM-parts:
  - elements that have the `hidable` class
    - `hidable` elements are shown when they contain an element that matches the applied filters, or when no filters are applied at all.
    - `hidable` elements can be nested (e.g. a DOM-element for product category "Electronics" has the `hidable` class, but it also has nested DOM-elements with the `hidable` class for sub-categories "Audio" and "Video". The "Electronics" DOM-element will be hidden when "Audio" and "Video" are also hidden)
  - elements that have the `data-facet-XXXX="filter value"`-attribute. Here `XXXX` is the facet category, and `filter value` is the value that will be filterable within the facet category.
    - Optionally a `data-facet-XXXX-order="ORD"` attribute can be added to customize ordering of the facet values to be displayed in the facet-placeholders. `ORD` is the value to be used for sorting the facet values, using the default string sort.
  - elements with the `facet-placeholder`-class will be used as the container to add the facet filter elements to, e.g. `<div class="facet-placeholder data-facet-type="XXXX"></div>`. The `data-facet-type="XXXX"`-attribute sets the category for which the placeholder will show the filter values, i.e. there should be elements with `data-facet-XXXX="..."` elsewhere.
  
That's all folks.
