
  const warningExamples = ['Owned by Google', 'Visited often by biker gangs', 'Always play 80s-90s soundtracks', 'Near petroleum refinery', 'All organic produce', 'Very pretty but very crowded', 'They require vaccinations', 'Place was rebuilt in 1998', 'Very low prices'];
  const usedStations = [];
// ==============================================================
function addOption (list) {
    let target = event.target ? event.target : list;

    let inputs = DOM(list).Find('.picked*').length;

    if (target.tagName === 'OPTION' && inputs < 3) {
      DOM.Make('input').Attr({type: 'text', name: list.id, value: target.innerText, maxlength: 40, minlength: 5, class: 'selected-input'}).AddTo(`#${list.id}Header>>`);
      DOM(target).Attr({disabled: true}).Class('bg-dark picked');
    }
}
// ==============================================================

window.addEventListener('load', () => {
  const submit = DOM('#submit');
  const reset = DOM('#reset');
  const title = DOM('#title');
  const city = DOM('#city');
  const state = DOM('#state');
  const nameFeedback = DOM('#nameFeedback')
  const stationNames = DOM('#stationNames');
  const fileText = DOM('#fileText');


  if (station) {
    DOM('#description').value = station.description || '';
    DOM('#title').value = station.name || '';
    DOM('#zipcode').value = station.zipcode|| '';
    DOM('#city').value = station.geometry.location[0] || '';
    DOM('#state').value = station.geometry.location[1] || '';
  }

  /*This array (after the for loop occurs anyway), contains the NAMES of each separate Paragraph Element
  created at the bottom of the body (of stationNames). We did this because we could not collect the names by
  declaring a variable from the object with EJS*/
  for (let i of stationNames.children) {
    if (station && station.name === i.innerText) {
      continue;
    } else usedStations.push(i.innerText);
  }


  /*This function runs, and each time it does it takes our form (with the class "validated") and converts it into an array and runs a function with it. This function will do an initial check of the "name" input to verify its validity, but primarily this function checks if the forms (with the REQUIRED attribute) have any input, and if they don't, their validity is false and submission is stopped, else it will add "was-validated" and it will pass*/
// ==============================================================
  (async function() {
    Array.from(DOM('.validated*'), function(form) {

    form.addEventListener('submit', async function(event) {
      nameFeedback.innerText = 'Required';

      for (let i of usedStations) {
        if (title.value === i) {
          title.value = '';
          nameFeedback.innerText = 'Name already in use';
        }
      };

      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
      }, false);

    });
  })();
/// ==============================================================
  addWarning.addEventListener('click', (e) => {
    if (DOM('#warningList').children.length < 6) {
      DOM.Make('input').Class('warning form-control')
      .Attr({type: 'text', name: 'warnings[]', maxlength: 50, placeholder: warningExamples.random()})
      .AddTo('#warningList>');
    }
  });
  removeWarning.addEventListener('click', (e) => {
    if (DOM('#warningList').children.length > 0) {
      DOM('#warningList').children.item('').remove(); // Empty means last element
    }
  });
// ==============================================================
  images.addEventListener('change', function (e) {
      // Good god, had to do all of this just to make the <input> File upload display the text of whatever you uploaded.

      fileText.innerText = Array.from(this.files).map( f => f.name).join(', ')
      const srcImage = DOM('#srcImage');

      srcImage.src = URL.createObjectURL(this.files[0]);
      DOM('.title-image-note').Show();
  });
// -------------------------------------------------
  //Resets all inputs, and removes any ".hide" classes
  reset.addEventListener('click', function (e) {
      DOM('#affiliates').Find('option*').NoAttr(['disabled']).Class('!bg-dark');
      DOM('#industry').Find('option*').NoAttr(['disabled']).Class('!bg-dark');
      DOM('.warning*').Remove();
      DOM('.selected-input*').Remove();
      DOM('.form-control*').NoAttr(['value']);
  });
});
