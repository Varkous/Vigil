window.addEventListener('load', () => {
  DOM('#searchBar').addEventListener('input', (e) => {
    const searchQuery = DOM('#searchBar').value.toLowerCase();
    if (searchQuery.length >= 3) {
      const queryMatch = DOM('.station*').Attr('id').filter( card => {
        let cardName = card.id.toLowerCase();
        let cardLoc = DOM(card).Find('.station-loc').innerText.toLowerCase();
        if (!searchQuery.isNotIn(cardName, cardLoc))
          return card;
      });
      DOM(queryMatch).AddTo('#cardHolder<');
    }
  });
});
