
    for (let headnote of DOM('.button-reveal*')) {
      headnote.addEventListener('click', function (e) {
        event.stopPropagation();
        event.preventDefault();

        let content = DOM(this.parentNode).Relatives('siblings>', '.core-content');
        if (DOM(content).Class('').contains('reveal-content')) {
          this.innerText = '↓'
          DOM(content).Class('!reveal-content');
          DOM(this).Relatives('parent', '.entry').Class('!expand');
        } else {
          this.innerText = '↑'
          DOM(content).Class('reveal-content');
          DOM(this).Relatives('parent', '.entry').Class('expand').scrollIntoView();
        }
      });
    };
// ----------------------------------------------------
    DOM.Make('li', 3).map( (li, i) => {
      if (i === 0 && thisUser.stations)
        li.innerText = `Stations listed: ${thisUser.stations.length}`;
      if (i === 1 && thisUser.reviews)
        li.innerText = `Reviews posted: ${thisUser.reviews.length}`;
      if (i === 2 && thisUser.articles)
        li.innerText = `Articles created: ${thisUser.articles.length}`;

      DOM(li).AddTo('#amountCreated>');
    });
// ----------------------------------------------------
    window.addEventListener('scroll', () => {
      if (window.innerWidth < 1200) {
        DOM('.article-list').Class('make-row');
      } else DOM('.article-list').Class('!make-row');
    });
