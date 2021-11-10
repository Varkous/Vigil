
/*===============================================================
  Any strings (arguments) passed in will be replaced.
===============================================================*/
String.prototype.strip = function (strings) {
  let strippedString = this;
  let remove = strings.split(' ');
  if (arguments.length > 1) {
    remove = arguments;
  }
  for (let str of remove) {
    strippedString = strippedString.replaceAll(str, '');
  }
  return strippedString;
};

/*===============================================================
  Not very necessary, did it for readability since "!includes(thing) can take a few glances".
===============================================================*/
String.prototype.isNotIn = function () {

  for (let comparison of arguments) {
    if (Array.isArray(comparison)) {
      for (let c of comparison) {
        if (c.includes(this)) return false;
      }
    } else if (comparison.includes(this)) return false;
  };
  return true;
};

/*===============================================================
  Compares a given string to any amount of string parameters for exact match, if a parameter is an array, loop over that as well.
===============================================================*/
String.prototype.matchesAny = function () {
	for (let str of arguments) {
	  if (Array.isArray(str)) {
	    for (let s of str) {
	      if (this === s) return true;
	    }
	  } else if (this === str) return true;
  };
}

/*===============================================================
  Compares a given string to any amount of string parameters for rough match, if a parameter is an array, loop over that as well.
===============================================================*/
String.prototype.includesAny = function () {
	for (let str of arguments) {
	  if (Array.isArray(str)) {
	    for (let s of str) if (this.includes(str)) return true;
	  } else if (this.includes(str)) return true;
  };
}

/*===============================================================
  Finds and returns any characters in the given string that match the parameters.
===============================================================*/
String.prototype.steal = function (chars) {
  chars = Array.from(chars);
  return this.split('').filter( l => l === chars.find( c => c === l)).join('');
}

/*===============================================================
  Had to create own method for simply getting last element of given array without mutating.
===============================================================*/
Array.prototype.last = function (index) {return index ? this.length - 1 : this[this.length - 1]};
NodeList.__proto__.last = function (index) {return index ? this.length - 1 : this[this.length - 1]};

/*===============================================================
  For retrieving the exact element within array (short-hand for array[array.indexOf(<whatever>)].
===============================================================*/
Array.prototype.get = function (element) {
	if (typeof(element) === 'number')
	  return this[element];
	else return element ? this[this.indexOf(element)] : false;
};

/*===============================================================
  Retrieve random index element within array.
===============================================================*/
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
};
  // ==================================================
function paginateContent(element, children, maxcontent = 2) {
  //Element: The element that houses the content to paginate,
  //Children: The elements that will be spawned from pagination
  //Maxcontent: The amount to display upon pagination

  if (!element || !children || !children.length) return false;

  const scrollMax = element.offsetHeight;
  const scrollBar = (window.scrollY + window.innerHeight);

  if (scrollBar >= scrollMax - 50 || scrollBar > document.body.offsetHeight) {

    for (let i = 0; i < maxcontent; i++) {
      DOM(children[i]).Show();
    }
  } else return false;
};
// ==================================================
function matchesAny(operand, chars) {
  let found = false;
  if (Array.isArray(operand)) {
    for (let op of operand) {
      found = matchesAny(op, chars);
      if (found === true) return true;
    };
  } else for (let str of arguments) {
    if (str === arguments[0]) continue;
    if (Array.isArray(str)) {
      for (let s of str) {
        if (operand === s) return true;
      }
    } else if (operand === str) return true;
  };
};
