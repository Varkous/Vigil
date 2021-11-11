window.addEventListener('scroll', (e) => {
  let scrollPercentage = Math.floor(window.scrollY / (document.body.offsetHeight - window.innerHeight) * 100);

  if (scrollPercentage >= 12)
    DOM('section*')[0].style.transform = `translateX(0%)`;

  if (scrollPercentage >= 22)
    DOM('section*')[1].style.transform = `translateX(0%)`;

  if (scrollPercentage >= 35)
    DOM('section*')[2].style.transform = `translateX(0%)`;

  if (scrollPercentage >= 50)
    DOM('section*')[3].style.transform = `translateX(0%)`;

  if (scrollPercentage >= 70)
    DOM('section*')[4].style.transform = `translateX(0%)`;
});

window.addEventListener('click', (e) => {

 if (e.target.tagName === 'A' && e.target.href.includes('#')) {
   DOM('.wtf-modal').Show();
 } else DOM('.wtf-modal').Hide();
});
