window.addEventListener('scroll', (e) => {
  let scrollPercentage = Math.floor(window.scrollY / (document.body.offsetHeight - window.innerHeight) * 100);
  console.log (scrollPercentage);
  DOM('.header-map').style.transform = `translateX(${130 - Math.min(scrollPercentage * 2.5, 0)}%)`;
  DOM('.header-posts').style.transform = `translateX(-${130 - Math.min(scrollPercentage * 2.5, 0)}%)`;
  // DOM('.header-posts').style.transform = `translateX(-${-130 + Math.max(scrollPercentage * 1.2, 0)}%)`;
});
