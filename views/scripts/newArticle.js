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
addSpace.addEventListener('click', (e) => content.rows += 5);
reduceSize.addEventListener('click', (e) => content.rows -= 5);
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
photos.addEventListener('change', (e) => {
  while(photoList.firstChild)
    photoList.removeChild(photoList.firstChild);

  for (let i = 0; i < photos.files.length; i++) {
    DOM.Make('div').Class('col-sm-12').AddTo(photoList, '>').innerHTML = `
    <h6>Photo #${i + 1}</h6>
    <div class="row justify-content-around">
      <img class="img-fluid col-sm-12 col-md-6" src="${document.location.origin}/${photos.files[i].name}" width="300" height="300">
      <textarea class="d-inline-block content col-sm-12 col-md-6" cols="30" rows="5" name="explanation[]" placeholder="Write brief explanation of events/context of the given photo"></textarea>
    </div><hr>`
  }
});
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
resetImages.addEventListener('click', (e) => {
    event.preventDefault();
    while (photoList.firstChild) {
      photoList.removeChild(photoList.firstChild);
    }
});
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
DOM('#addLink').addEventListener('click', (e) => {
  if (DOM('#linkList').children.length < 8) {
    let newInputGroup = DOM.Make('div').Class('form-group d-flex');
    DOM.Make('label').AddTo(newInputGroup, '>').innerText = `Link #${DOM('#linkList').children.length + 1}`;
    // -------------------------
    DOM.Make('input').Class('form-control content').Attr({type: 'text', name: 'urls', required: true, placeholder: 'Link/URL'}).AddTo(newInputGroup, '>');
    // -------------------------
    DOM.Make('input').Class('form-control content').Attr({type: 'text', name: 'headnotes', required: true, placeholder: 'Highlight note', maxlength: 40}).AddTo(newInputGroup, '>');
    // -------------------------
    DOM(newInputGroup).AddTo('#linkList>');
  }
});
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
DOM('#removeLink').addEventListener('click', (e) => {
  if (DOM('#linkList').children.length > 0) {
    DOM('#linkList').Find('.form-group*').last().remove();
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
