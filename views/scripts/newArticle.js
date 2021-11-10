const addSpace = DOM('#addSpace');
const reduceSize = DOM('#reduceSize');
const content = DOM('#content');
const articleDate = DOM('#articleDate')
const photos = DOM('#photos');
const photoList = DOM('#photoList');
const resetImages = DOM('#resetImages');
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
/*This function runs, and each time it does it takes our form (with the class "validated") and converts it into an array
and runs a function with it. This function checks if the forms (with the REQUIRED attribute) have any input, and if they don't, their validity is
false and submission is stopped, else it will add "was-validated" and it will pass*/
(function() {
  Array.from(DOM('.validated*'), function(form) {

    form.addEventListener('submit', function(event) {
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
function getLastMarker(articleText, indice) {
  let total = DOM(`#${indice.toLowerCase()}List`).children.length;
  if (!total) return articleText;
  console.log (`(${indice} #${total})`);
  let markerPoint = articleText.lastIndexOf(`(${indice} #${total})`);
  let markerText = articleText.substring(markerPoint, markerPoint + (indice.length + 5)); // +5 is to include: "(", " ", "#", "the number [0-9]", and ")"
  console.log (articleText.substring(markerPoint, markerPoint + (indice.length + 5)));
  return articleText.replace(markerText, '');
};
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
addSpace.addEventListener('click', (e) => content.rows += 5);
reduceSize.addEventListener('click', (e) => content.rows -= 5);
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
photos.addEventListener('change', function (e) {
  let totalFiles = this.files.length;

  while (photoList.firstChild) {
    DOM('#content').value = getLastMarker(DOM('#content').value, 'Photo');
    photoList.removeChild(photoList.firstChild);
  }

  for (let i = 0; i < photos.files.length; i++) {
    DOM.Make('div').Class('col-sm-12').AddTo(photoList, '>').innerHTML = `
    <h6>Photo #${i + 1}</h6>
    <div class="row justify-content-around">
      <img class="img-fluid col-sm-12 col-md-6" src=${URL.createObjectURL(photos.files[i])} width="300" height="300">
      <textarea class="d-inline-block content col-sm-12 col-md-6" cols="30" rows="5" name="explanation[]" placeholder="Write brief explanation of events/context of the given photo"></textarea>
    </div>`
    DOM('#content').value += `\r (Photo #${i + 1})`;
  }

});
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
resetImages.addEventListener('click', (e) => {
  event.preventDefault();
  DOM('#photos').value = null;
  while (photoList.firstChild) {
    DOM('#content').value = getLastMarker(DOM('#content').value, 'Photo');
    photoList.removeChild(photoList.firstChild);
  }
});
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
DOM('#addLink').addEventListener('click', (e) => {
  if (DOM('#linkList').children.length < 8) {
    const amount = DOM('#linkList').children.length + 1;
    DOM('#content').value += `\r (Link #${amount})`;
    let newInputGroup = DOM.Make('div').Class('form-group d-flex');
    DOM.Make('label').AddTo(newInputGroup, '>').innerText = `Link #${DOM('#linkList').children.length + 1}`;
    // -------------------------
    DOM.Make('input').Class('form-control content').Attr({type: 'text', name: 'urls[]', required: true, placeholder: 'Link/URL'}).AddTo(newInputGroup, '>');
    // -------------------------
    DOM.Make('input').Class('form-control content').Attr({type: 'text', name: 'headnotes[]', required: true, placeholder: 'Highlight note', maxlength: 40}).AddTo(newInputGroup, '>');
    // -------------------------
    DOM(newInputGroup).AddTo('#linkList>');
  }
});
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
DOM('#removeLink').addEventListener('click', (e) => {
  if (DOM('#linkList').children.length > 0) {
    DOM('#content').value = getLastMarker(DOM('#content').value, 'Link');
    DOM('#linkList').Find('.form-group*').last().remove();
    // DOM('#content').value = DOM('#content').value.replace(/ *\([^)][Link #0-9]*\)\n? *$/, ""); //Sigh. Replaces all text within parantheses "()" that contains "Link #[any number]" in order to remove Link marker
  }
});

DOM('select').addEventListener('change', function (e) {
  let station = stations.find( s => s.id === this.value);
  DOM('.selected-station').innerHTML = `
    <div class="col-4">
      <span class="text-light">Title:</span> <a href="/station/${station.id}">${station.name}</a>
    </div>
    <div class="col-4">
      <span class="text-light">Owner:</span> <h6>${station.owner}</h6>
    </div>
    <div class="col-4">
      <span class="text-light">Location:</span> <h6>${station.geometry.location.join(', ')}</h6>
    </div>
  `
});
