// ==============================================================================
function OneOrAll(tag, parent = document) {

  if (!tag) return false;
  if (typeof(tag) === 'object') return isCollection(tag) ? tag[0] : tag;
  // Some string-tags will contain symbols that indicate to the DOM function a method to perform, and to avoid obvious problems, does not treat ".#-_" as denoter symbols
  let symbol = tag.replace(/[/a-zA-Z0-9.#]+/g, ''); // Parse all alpha-numeric characters to get action symbol
  tag = Array.isArray(tag) ? tag.map( t => t.replace(/[/!@$%&*()=+';<>:,?']+/g, '').replace(' ', ',')).join() : tag.replace(/[/!@$%&*()=+';<>:,?']+/g, '').replace(' ', ','); // Basically any symbols excluding (.#-_). Additionally, a SPACE or ',' means multiple tags have been passed in

  if (symbol.includes('*') || tag.includes(',')) { // If 'selectAll' denoter used, if multiple element tags were input, or if parent is an array for some reason
    if (isNodeList(parent) && parent.length) tag = parent[0].querySelectorAll(tag); // Ensures it's a node list or array before using first element
    else tag = parent.querySelectorAll(tag); // Then not an array, but multiple tags needs 'all' query
  } else tag = parent.querySelector(tag); // Not an array and just one tag = one element

  return tag;
};
// ==============================================================================
function DivideTags (entries, except) {
  return (typeof(entries) === 'string' ? entries.replace(/[/@$%&*()=+?';<>:,']+/g, '').replace(/ /g, ',').split(',') : Array.from(entries)).filter(Boolean);
}
// ==============================================================================
function TranslateDenoter(symbol, method) {

  symbol = method ? method : symbol.steal(['*', '@', '!', '^', '&', '>', '>>', '<', '<<']);
  if (symbol.includesAny('>', 'append', 'toEnd')) method = "append";
  if (symbol.includesAny('>>', 'insert', 'after')) method = "after";
  if (symbol.includesAny('<', 'prepend', 'toStart')) method = "prepend";
  if (symbol.includesAny('<<', 'before', 'behind')) method = "before";

  return method;
};
// ==================================================
function isNodeList(element) {
  if (element && element.__proto__ == NodeList.__proto__ ) { // Node list is not the same as an array
    return true;
  } else return false;
}
function isCollection(element) {
  if (element && element.__proto__ == HTMLCollection.__proto__) { // Node list is not the same as an array
    return true;
  } else return false;
}
// ==================================================
function iterateAttributes(attributes, element) {
  let found = [];
  let getElements = '?'.isNotIn(attributes);
  attributes =  DivideTags(attributes);

  // Ensures it can be iterated
  for (let a of attributes) {
    if (element.attributes.getNamedItem(a)) // DOM method on all attribute lists to find the property
      getElements ? found.push(element) : found.push(element.attributes.getNamedItem(a).value || element.attributes.getNamedItem(a).name);
      /* Store only its value if query marker '?' is used. Else store the element with the matched attribute */
  };
  return found;
}
// ==================================================
function searchForRelatives (methods, exist, element) {
  let relatives = [];
  for (let method of methods) {
    let relative = element[method];
    while (relative) { // Every time a sibling or parent is found (depends on method), cascade it and search for the next relative of the given relative until it has found all subsequent elements with the given tags
      if (exist.find( e => e === DOM(relative))) {
        relatives.push(relative);
      }
      relative = relative[method];
    }
  }
  return relatives;
}
/*===============================================================
  Class-inspired Object with factory functions that provide DOM manipulation methods to DOM elements.
===============================================================*/
const DOM = function (tag = document, parent = document) {
  parent = this !== window && this !== DOM && typeof(parent) !== 'object' ? this : parent;
  // Just to make sure its not the window object, and that it's either the passed-in parent element, or THIS (which would be the querying element)

  let element = OneOrAll(tag, parent); // Determines whether its a single element, or an array-like Node List of elements
  if (element === window || element === DOM || !element) {
    return console.error(`No element ${element} (${tag}) found in retireval attempt`);
  }

  if (isNodeList(element)) {
    element.forEach( e => Object.assign(e, DOM.__proto__));
  } else if (isCollection(element)) Object.assign(element[0], DOM.__proto__);
  //This stuff above merges the prototype methods (Find, Make, Attr, etc.) that belong to the DOM function with the element's methods, so the element can use them to interact with any subsequent elements

  Object.assign(element, DOM.__proto__); // Do this regardless, since the array/nodelist/collection will need methods as well
  return element;
};
// ==============================================================================
DOM.__proto__.Make = function (tags, amount = 1) {
  tags = DivideTags(tags);

  let fragment = new DocumentFragment();
  for (let i = 0; i < amount; i++) {
    for (let tag of tags) {
      let ele = document.createElement(tag);
      fragment.appendChild(ele);
    }
  };

  return DOM(fragment.children.length < 2 ? fragment.children[0] : Array.from(fragment.children));
};
// ==============================================================================
DOM.__proto__.Find = function (tag) {
  let parent = this !== window && this !== DOM ? this : document;
  // Needs to be document or the referring element

  let ele = DOM(tag, parent);
  return ele !== window && ele !== DOM ? ele : console.error(`No element ${ele} found in retireval attempt`);
};
// ==============================================================================
DOM.__proto__.Class = function (classes = '', tag) {
  let elements = this !== window && this !== DOM ? this : OneOrAll(tag);
  let query = classes.replace(/ /g, ',').split(',').filter(c => c.includes('?')).length ? true : false;
  // If any '?' was present, client is querying if class exists on element


  if (classes) {
    classes = DivideTags(classes); // String of classes divided by "," can also be turned into array

    if (isNodeList(elements) && elements.length) { // Sometimes array sometimes not
      elements.forEach( e => {
        if (query) {

          if (matchesAny(Array.from(e.classList), classes)) {
            return query = 'found';
          } else if (query !== 'found') return query = 'nope';
        } // Not querying below
        else classes.map( (c) => { // If "!" is included, it means to remove that class. Else add it (without the "!") of course);
          if (c[0] === '!' && !query) {
            e.classList.remove(c.slice(1));
          } else if (!query) e.classList.add(c);
        });
      });
    } else classes.map( (c) => {
      if (query) {

        if (matchesAny(Array.from(elements.classList), classes)) {
          return query = 'found';
        } else if (query !== 'found') return query = 'nope';
      } else c[0] === '!' ? elements.classList.remove(c.slice(1)) : elements.classList.add(c);
      // If '!' is present, as mentioned above, client is removing that class
    });

    if (query) {
      return query === 'found' ? true : false;
    } else return elements;
  } else return elements ? elements.classList || elements[0].classList : console.error('No element found to check classes'); // If no classes were passed in, (and assuming we found an element), return the class list of that element since it's the only other thing the client could want
};
// ==============================================================================
DOM.__proto__.Attr = function (attributes, tag) {
  let elements = this !== window && this !== DOM ? this : OneOrAll(tag);
  let query = Array.isArray(attributes) || typeof(attributes) === 'string';
  // If it's an object, the client is setting new attributes. If not, it's a query for those attributes
  let returnValues = []; // For query only
  // ----------------------------------------------------------
  if (elements && attributes) {

    if (isNodeList(elements) && elements.length) { // If it's a node list array
      elements.forEach( e => { // Go through each element
        if (query) returnValues = returnValues.concat(iterateAttributes(attributes, e));
        //Return any attribute values of the element if query
        else { // Set a new attribute based on the passed-in attributes object
          for (let a in attributes) {
            e[a] = attributes[a];

            e.setAttribute(a, attributes[a]);
          }
        }
      });
    // ----------------------------------------------------------
  } else { // Same as above except just for the single element
      if (query) returnValues = returnValues.concat(iterateAttributes(attributes, elements));
      else {
        for (let a in attributes) {
          if (Array.isArray(elements) || isCollection(elements)) { // Then likely a Node List with one element as the only index
            elements[0].setAttribute(a, attributes[a]);
            elements[0][a] = attributes[a];
          } else if (!isNodeList(elements)) {
            elements.setAttribute(a, attributes[a]);
            elements[a] = attributes[a];
          } else return console.error(`Empty node list ${elements}. Could not find attributes`);
        }
      }
    } // End of: If it is one element, not an array
  } // End of: If there were any attributes passed in

  if (query) {
    returnValues = returnValues.filter(Boolean);
    if (returnValues.length > 1)
      return returnValues;
    else return returnValues.length === 1 ? returnValues[0] : returnValues;
  } else if (isCollection(elements)) return elements[0];
  else return elements;
};
// ==============================================================================
DOM.__proto__.NoAttr = function (attributes) {
  let elements = this !== window && this !== DOM ? this : null;
  attributes = typeof(attributes) === 'string' ? attributes.replace(/ /g, ',').split(',') : Array.from(attributes);
  // Ensures its an array for less conditional statements
  if (!elements) return console.error('No element referred to for attribute deletion');
  if (attributes) { // Iterate all attribute values passed (needs to be an array), and remove them
    if (elements.length) { // Sometimes array sometimes not
      elements.forEach( e => {
        for (let a of attributes) e.removeAttribute(a);
      });
    } else for (let a of attributes) elements.removeAttribute(a);
  }
  return elements;
};

// ==============================================================================
DOM.__proto__.AddTo = function (parent, method, subjects) {
  subjects = this !== window && this !== DOM ? this : OneOrAll(subjects);

  if (typeof(parent) === 'object') { // Then it's a DOM node, not a tag-string
    method = TranslateDenoter(method); // Method will be a denoter symbol (like > or <<) to indicate HOW the element should be added (append, prepend, etc.)
    parent = parent;
  } else {
    method = TranslateDenoter(parent, method); // The denoter can/should be within the tag-string in this case
    parent = OneOrAll(parent);
  }
  if (!method) return console.error(`No insertion or adding method used to place ${subjects} on`, parent);

  parent[`${method}`](subjects); // 'TranslateDenoter' returned the proper DOM method for node relocation based on the denoter/symbol passed-in
  return subjects.length && subjects.length < 2 ? subjects[0] : subjects || parent;
};
// ==============================================================================
DOM.__proto__.Remove = function () {
  let element = this !== window && this !== DOM ? this : console.error('No elements referenced for removal');
  if (isNodeList(element) && !element.length) //If it's an empty node list
    return console.error(`No element ${element} available to remove`);

  return isNodeList(element) && element.length ? element.forEach( e => e.remove()) : element.remove();
};
// ==============================================================================
DOM.__proto__.HTML = function (HTML_String) {
  let element = this !== window && this !== DOM ? this : console.error('No elements referenced for removal');
  if (element.length) return console.error('Can only select a single element for HTML alteration')
  element.innerHTML = HTML_String;
  return element;
};
// ==============================================================================
DOM.__proto__.Show = function (callback) {
  let elements = this !== window && this !== DOM? this : console.error('No elements found besides document');
  elements = isNodeList(elements) ? elements : [elements]; // Make sure its an array-type
  let visible = [];
  for (let ele of elements) {
    if (ele === document) {
      return false;
    }

    if (window.getComputedStyle(DOM(ele)).display === 'none' || DOM(ele).Attr('hidden?').length) {
      DOM(ele).style.display = '';
      DOM(ele).Class('!hide');
      DOM(ele).hidden = false;
    } else visible.push(ele);
  };
  return callback ? callback(DOM(visible)) : DOM(elements.length < 2 ? elements[0] : elements);
};
// ==============================================================================
DOM.__proto__.Hide = function (callback) {
  let elements = this !== window && this !== DOM ? this : console.error('No elements found besides document');
  elements = isNodeList(elements) ? elements : [elements]; // Make sure its an array-type

  for (let ele of elements) {
    DOM(ele).style.display = 'none';
    DOM(ele).hidden = true;
  };
  return callback ? callback(DOM(elements.length < 2 ? elements[0] : elements)) : DOM(elements.length < 2 ? elements[0] : elements);
};
// ==============================================================================
DOM.__proto__.Relatives = function (type, tags) {
  let element = this !== window && this !== DOM && this !== document ? this : console.error('No element selected to find relatives');
  let methods = ''; // parentNode or next/previousSibling will be method
  let exist = Array.from(document.querySelectorAll(tags)); // Can't be one item or a node list

  if (!exist.length || !element)
    return console.error(`No relatives of element ${element} found`);

  if (type.includesAny('parent', 'parents', 'parentNode')) {
    methods = ['parentNode'];
  } else if (type.includesAny('sibling', 'siblings')) {
    if (type.includes('>')) methods = ['nextSibling'];
    else if (type.includes('<')) methods = ['previousSibling'];
    else methods = ['previousSibling', 'nextSibling'];
  }
  if (!methods) return console.error('Invalid method used to find relatives');

  let relatives = searchForRelatives(methods, exist, element);

  return relatives.length && relatives.length < 2 ? relatives[0] : relatives;
};
