window.addEventListener('load', () => {
  DOM('#searchBar').addEventListener('input', (e) => {
    const searchQuery = DOM('#searchBar').value.toLowerCase();

    if (searchQuery.length >= 1) {
      const queryMatch = DOM('.station*').Attr('id').filter( card => {
        let searchBy = DOM('.checked').value === 'Location' ? DOM(card).Find('.station-loc').innerText.toLowerCase() : card.id.toLowerCase();
        if (searchBy.includes(searchQuery))
          return card;
      });
      if (queryMatch.length) DOM(...queryMatch).AddTo('#cardHolder<');
    }

  });
});

window.addEventListener('click', (e) => {
  if (DOM(e.target).checked && DOM(e.target).Relatives('siblings', '.checkbox').checked) {
    DOM(e.target).Class('checked');
    DOM(e.target).Relatives('siblings', '.checkbox').Class('!checked').click();
  }
});
