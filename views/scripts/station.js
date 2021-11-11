for (let review of DOM('.edit-review*')) {
  review.addEventListener('click', function (){
    DOM('.review-box*').Show();
    let reviewBox = DOM(this).Relatives('parent', '.review-box').Hide();
    let review = station.reviews.find( r => r._id === reviewBox.id);
    DOM('#editReviewForm').Attr({action: `/review/edit/${review._id}?_method=PUT`}).Show().AddTo(reviewBox, '<<').Find('textarea').Attr({value: review.content});
    /* ---------------------------- Need to get Find to work (problem operating on node list)*/
  });
}

window.addEventListener('scroll', () => {
paginateContent(DOM('.review-list'), DOM('.review-box.hide*'), 2);
});

function imageDisplay (button, imageList) {
  for (let image of imageList.children) {
    DOM(image).Show( (visible) => {
      if (visible.length) {
        DOM(...visible).Hide();
        button.innerText = `Show Images (${imageList.children.length})`;
      } else button.innerText = 'Hide Images';
    });
  };
};

function hideReviewForm() {
  DOM('#editReviewForm').Hide();
  DOM('.review-box*').Show();
}
